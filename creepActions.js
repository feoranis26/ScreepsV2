module.exports = {
    name: "creepActions"
    ,
    getEnergyInternal: function (creep) {
        let str = Game.getObjectById(creep.memory.energyIn);
        if (creep.memory.energyInType == "str" || creep.memory.energyInType == "stor") {
            if (creep.withdraw(str, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(str);
                let path = Room.deserializePath(creep.memory._move.path);
                creep.room.visual.poly(path, { stroke: "red", lineStyle: 'dashed', opacity : 0.5 });
                creep.room.visual.circle(str.pos, {radius:0.675, stroke: "black", fill:"red"})
            } else if (creep.withdraw(str, RESOURCE_ENERGY) == ERR_NOT_ENOUGH_RESOURCES) {
                creep.memory.energyIn = undefined
            } else if (creep.withdraw(Game.getObjectById(creep.memory.energyIn)) == ERR_INVALID_TARGET) {
                creep.memory.energyIn = undefined;
            }
        }
        else if (creep.memory.energyInType == "res") {
            if (creep.pickup(str, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(str);
            }
            else if (creep.pickup(Game.getObjectById(creep.memory.energyIn)) == ERR_INVALID_TARGET) {
                creep.memory.energyIn = undefined;
            }
        }
    },
    getEnergy: function (creep) {
        //Cache potential energy sources so we don't calculate them for every creep, this would save a lot of cpu
        if (!creep.memory.energyIn) {
            if (Game.time % 3 != 0 && Game.cpu.bucket < 5000) { return false }
            if(!Memory.rooms[creep.room.name]) return

            let storages = []
            let sources = []

            for (let idNum in Memory.rooms[creep.room.name].energy.storages) {
                storages.push(Game.getObjectById(Memory.rooms[creep.room.name].energy.storages[idNum]))
            }

            for (let idNum in Memory.rooms[creep.room.name].energy.sources) {
                sources.push(Game.getObjectById(Memory.rooms[creep.room.name].energy.sources[idNum]))
            }

            if (creep.memory.role != "carrier") {
                var str = creep.pos.findClosestByPath(sources, { filter: (s) => { if (!s.pos.inRangeTo(creep.pos, 10)) {  return false } if (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_LINK  ) { return s.store.energy > creep.carryCapacity } } });//   s.store.energy > creep.carryCapacity } } });
                if (!str) {
                    str = creep.pos.findClosestByPath(sources, { filter: (s) => { if (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_LINK) { return s.store.energy > creep.carryCapacity && (!Memory.rooms[creep.room.name].inLink || s.id != Memory.rooms[creep.room.name].inLink)} } });
                }
            }
            else {
                var str = creep.pos.findClosestByPath(sources, { filter: (s) => { if (!s.pos.inRangeTo(creep.pos, 5)) { return false } if (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_LINK) { return s.store.energy > creep.carryCapacity && (!Memory.rooms[creep.room.name].inLink || s.id != Memory.rooms[creep.room.name].inLink)} } });
                if (!str) {
                    str = creep.pos.findClosestByPath(sources, { filter: (s) => { if (!s.pos.inRangeTo(creep.pos, 5)) { return false } if (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_LINK) { return s.store.energy > 0 && (!Memory.rooms[creep.room.name].inLink || s.id != Memory.rooms[creep.room.name].inLink)} } });
                }
            }
            if (str) {
                creep.memory.energyIn = str.id;
                creep.memory.energyInType = "str";
            }
            else {
                str = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, { filter: (r) => r.amount >= creep.carryCapacity && r.resourceType == RESOURCE_ENERGY });
                if (str) {
                    creep.memory.energyIn = str.id;
                    creep.memory.energyInType = "res";
                    this.getEnergyInternal(creep)
                    return true
                }
                else {
                    let storage = creep.pos.findClosestByPath(storages, {
                        filter: (s) => {
                            if (this.storageStr.includes(s.structureType)) {
                                return s.store.energy > 25000
                            }
                        }
                    })
                    if (storage) {
                        creep.memory.energyIn = storage.id
                        creep.memory.energyInType = "stor"
                        this.getEnergyInternal(creep)
                        return true
                    }
                    else {
                        str = creep.pos.findClosestByPath(sources, { filter: (s) => { if (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_LINK) { return s.store.energy > 0 && (!Memory.rooms[creep.room.name].inLink || s.id != Memory.rooms[creep.room.name].inLink)} } });
                        if (str) {
                            creep.memory.energyIn = str.id;
                            creep.memory.energyInType = "str";
                            this.getEnergyInternal(creep)
                            return true
                        }
                        else {
                            str = creep.pos.findClosestByPath(sources, { filter: (s) => { if (s.structureType == STRUCTURE_CONTAINER) { return s.store.energy > 0 } } });
                            if (str) {
                                creep.memory.energyIn = str.id;
                                creep.memory.energyInType = "str";
                                this.getEnergyInternal(creep)
                                return true
                            }
                            else {
                                return false
                            }
                        }
                    }
                }
            }
        }
        else {
            this.getEnergyInternal(creep)
            return true
        }
    }, moveToRoomUsingHighways: function (creep, roomName) {
        if (!creep.memory.path || creep.memory.lastRoomIndex == undefined || creep.memory.path[creep.memory.lastRoomIndex] == undefined) {
            let path = Game.map.findRoute(creep.room, roomName, {
                routeCallback: function (rn) {
                    //console.log(rn)
                    let rnX = rn.substring(1, 3)
                    let rnY = rn.substring(4, 6)
                    if (!
                        (rnX % 10 == 0 ||
                            rnY % 10 == 0 ||
                            rn == roomName ||
                            rn == creep.room.name ||
                            Game.rooms[rn] != undefined
                        )) {
                        return Infinity
                    }
                    else {
                        return 1
                    }
                }
            })
            creep.memory.path = path
            creep.memory.lastRoomName = creep.room.name
            creep.memory.lastRoomIndex = 0
        }
        else {
            try {
                if (creep.room.name != creep.memory.path[creep.memory.lastRoomIndex].room) {
                    creep.moveTo(creep.pos.findClosestByPath(creep.memory.path[creep.memory.lastRoomIndex].exit))
                }
                else {
                    creep.memory.lastRoomIndex++
                    creep.memory.lastRoomName = creep.room.name
                    //creep.moveTo(new RoomPosition(25, 25, creep.room.name))
                    creep.moveTo(creep.pos.findClosestByPath(creep.memory.path[creep.memory.lastRoomIndex].exit))
                }
            }
            catch (e) {
                creep.memory.path == undefined;
            }
        }
    },
    getStorageStructures: function () {
        return [STRUCTURE_STORAGE, STRUCTURE_FACTORY, STRUCTURE_TERMINAL]
    },
    getEnergySourceStructures: function () {
        return [STRUCTURE_LINK, STRUCTURE_CONTAINER]
    },
    storageStr: [STRUCTURE_STORAGE, STRUCTURE_FACTORY, STRUCTURE_TERMINAL],
    room: function (room) {
        if(Game.time % 250 == 0) this.refreshEnergySources(room)
    },
    refreshEnergySources: function (room) {
        console.log("[Actions] Refreshing energy sources for room : " + room)

        Memory.rooms[room.name].energy = { storages: [], sources: [] };

        let storages = room.find(FIND_STRUCTURES, { filter: (s) => { return this.getStorageStructures().includes(s.structureType) } })
        let sources = room.find(FIND_STRUCTURES, { filter: (s) => { return this.getEnergySourceStructures().includes(s.structureType) } }) //TODO: Do this in 1 room.find operation
        
        for (let str in storages) {
            Memory.rooms[room.name].energy.storages.push(storages[str].id)
        }
        for (let str in sources) {
            Memory.rooms[room.name].energy.sources.push(sources[str].id)
        }
    }
};