let spawning = require("spawning");
module.exports = {
    name: "longharvester",
    suffix: "LH",
    amount: 6
    ,
    spawn: function (room, spawn, num) {
        //let num = _.sum(Game.creeps, (c) => c.memory.role == this.name && c.memory.home == room.name);
        let numSources = this.amount * Memory.rooms[room.name].ldsEnabled;
        if (num < numSources && room.energyAvailable >= Memory.rooms[room.name].energyReq) {
            if (spawn.spawnCreep(spawning.getLongHarvesterBody(room.energyAvailable), spawning.getName(room, this.suffix), { memory: { role: this.name, home: room.name, trips: 0 } }) == 0) {
                return false
            }
        }
        if (num < numSources) {
            return false
        }
        return true
    },
    run: function (creep) {
        if (Game.cpu.bucket < 100) {
            return;
        }

        if (!Memory.rooms[creep.memory.home].ldsEnabled) {
            creep.suicide()
        }

        this.checkAssignsForCreep(creep);
        if (!creep.memory.trips) { creep.memory.trips = 0; }

        if (creep.memory.target) {

            this.shouldFlee(creep)

            if (creep.carry.energy == 0) { creep.memory.returning = false }
            if (creep.carry.energy == creep.carryCapacity && !creep.memory.returning) { creep.memory.returning = true; creep.memory.trips++ }

            if (!creep.memory.returning && !creep.memory.run) {
                this.goHarvest(creep)
            }
            else if (Memory.actions.ldsMaintain[creep.room.name] == creep.id && !creep.memory.run) {
                this.maintain(creep);
            }
            else {
                this.goHome(creep)
            }

        }
        else {
            this.getTarget(creep);
        }
    },
    shouldFlee: function (creep) {
        if (Game.time % 8 == 0) {
            if (Memory.actions.ldsDangerous[creep.memory.target]) {
                creep.memory.run = true
            }
            else {
                creep.memory.run = false
            }
        }
    },
    goHarvest: function (creep) {
        if (creep.room.name != creep.memory.target && !Memory.actions.ldsDangerous[creep.memory.target]) {
            let xit_dir = creep.room.findExitTo(creep.memory.target)
            let xit = creep.pos.findClosestByPath(xit_dir)
            creep.moveTo(xit)
        }
        else {
            if (Game.time % 5 != 0 && creep.room.name == creep.memory.target) {
                let hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
                if (hostiles.length > 0) {
                    Memory.actions.ldsDangerous[creep.memory.target] = true;
                }
                else {
                    Memory.actions.ldsDangerous[creep.memory.target] = false;
                }
            }
            if (!Memory.actions.lds[creep.memory.target].includes(creep.id)) {
                creep.memory.target = undefined
            }
            this.findSource(creep);
            if (creep.memory.source) {
                let source = Game.getObjectById(creep.memory.source);
                if (!source) {
                    creep.memory.source = undefined
                    return
                }
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source)
                }
                else if (creep.harvest(source) != 0) {
                    creep.memory.source = undefined
                }
            }
        }
    },
    goHome: function (creep) {
        if (!creep.memory.storage) {
            let storage = Game.rooms[creep.memory.home].find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_STORAGE })[0]
            if (storage) {
                creep.memory.storage = storage.id
            }
        }
        else {
            if (!Game.getObjectById(creep.memory.storage)) {
                creep.memory.storage = undefined
                return
            }
            storage = Game.getObjectById(creep.memory.storage)
            creep.moveTo(storage)
            creep.transfer(storage, RESOURCE_ENERGY)
        }
    },
    getTarget: function (creep) {
        let possibleRooms = Memory.rooms[creep.memory.home].lds
        let usedRooms = Memory.actions.lds
        for (let i in possibleRooms) {
            let room = possibleRooms[i]
            if (!usedRooms[room]) {
                usedRooms[room] = [creep.id]
                creep.memory.target = room
                return
            }
            else {
                for (let j in usedRooms[room]) {
                    let id = usedRooms[room][j]
                    if (!Game.getObjectById(id)) {
                        Memory.actions.lds[room].splice(j, 1);
                    }
                    else if (Game.getObjectById(id).memory) {
                        //console.log(Game.getObjectById(id), Game.getObjectById(id).room.name)
                        if (Game.getObjectById(id).memory.target != room) {
                            Memory.actions.lds[room].splice(j, 1);
                        }
                    }
                    else {
                        Memory.actions.lds[room].splice(j, 1);
                    }
                }
                if (usedRooms[room].length < 5) {
                    creep.memory.target = room
                    if (!usedRooms[room].includes(creep.id)) {
                        usedRooms[room].push(creep.id)
                    }
                    return
                }
            }
        }
    },
    checkAssignsForCreep: function (creep) {
        if (!creep.memory.target) {
            let possibleRooms = Memory.rooms[creep.memory.home].lds
            let usedRooms = Memory.actions.lds
            if (Game.time % 25 != 0) { return }
            for (let i in possibleRooms) {
                let room = possibleRooms[i]
                if (!usedRooms[room]) {
                    usedRooms[room] = [creep.id]
                    creep.memory.target = room
                    return
                }
            }
        }
    },
    checkAssigns: function (room) {
        let possibleRooms = Memory.rooms[room.name].lds
        let usedRooms = Memory.actions.lds
        if (Game.time % 25 != 0) { return }
        for (let i in possibleRooms) {
            let room = possibleRooms[i]
            if (usedRooms[room]) {
                for (let j in usedRooms[room]) {
                    let id = usedRooms[room][j]
                    if (!Game.getObjectById(id)) {
                        Memory.actions.lds[room].splice(j, 1);
                    }
                    else if (Game.getObjectById(id).memory) {
                        if (Game.getObjectById(id).memory.target != room) {
                            Memory.actions.lds[room].splice(j, 1);
                        }
                    }
                }
            }
            if (usedRooms[room].length >= 5) {
                Memory.actions.lds[room].pop()
            }
        }
    },
    checkCreepAssign: function (creep) {
        if (Memory.actions.lds[creep.target].contains(creep.id)) {
            console.log(creep)
        }
    },
    getMaintainer: function (srcRoom) {
        if (!Memory.rooms[srcRoom.name] || !Memory.rooms[srcRoom.name].ldsEnabled) { return; }
        for (let ldsRN in Memory.rooms[srcRoom.name].lds) {
            let room = Game.rooms[Memory.rooms[srcRoom.name].lds[ldsRN]]
            if (Game.time % 25 != 0 || Memory.actions.lds[room.name] == undefined) { return; }
            let maintainer = Game.getObjectById(Memory.actions.ldsMaintain[room.name])
            if (!maintainer || maintainer == null) {
                console.log("No maintainer for room: " + room.name)
                let creepsInRoom = room.find(FIND_MY_CREEPS, {
                    filter: (c) => {
                        return c.memory.role == "longharvester"/* && c.carry.energy == c.carryCapacity*/ && c.room.name == room.name
                    }
                })
                if (creepsInRoom[0])
                    Memory.actions.ldsMaintain[room.name] = creepsInRoom[0].id
            }
            else if (maintainer.room.name != room.name) {
                let creepsInRoom = room.find(FIND_MY_CREEPS, {
                    filter: (c) => {
                        return c.memory.role == "longharvester" && c.carry.energy == c.carryCapacity && c.room.name == room.name
                    }
                })
                Memory.actions.ldsMaintain[room.name] = creepsInRoom[0].id
            }
        }
    },
    maintain: function (creep) {
        if (creep.room.name == creep.memory.target) {
            this.repair(creep);
        }
        else {
            let xit_dir = creep.room.findExitTo(creep.memory.target)
            let xit = creep.pos.findClosestByPath(xit_dir)
            creep.moveTo(xit)
        }
    },
    repair: function (creep) {
        let str = Game.getObjectById(this.getOut(creep))
        if (!str) {
            if (!creep.memory.build) {
                let str = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, { filter: (s) => s.room.name == creep.room.name })
                if (str)
                    creep.memory.build = str.id
            }
            else {
                str = Game.getObjectById(creep.memory.build)
                if (!str)
                    creep.memory.build = undefined
                creep.build(str);
                creep.moveTo(str);
            }
        }
        else {
            if (creep.repair(str) == ERR_INVALID_TARGET || str.hits == str.hitsMax) {
                creep.memory.outId = undefined;
                str = Game.getObjectById(this.getOut(creep))
            }
            if (creep.repair(str) == ERR_NOT_IN_RANGE) {
                creep.moveTo(str);
            }
        }
        if (str) {
            let path = Room.deserializePath(creep.memory._move.path);
            creep.room.visual.poly(path, { stroke: "orange", lineStyle: 'dashed', opacity: 0.1 });
            creep.room.visual.circle(str.pos, { radius: 0.5, fill: 'transparent', strokeWidth: 0.1, stroke: "lightblue" })
            creep.room.visual.text("🏗", str.pos.x, str.pos.y + 1);
        }
        if (creep.carry.energy == 0) {
            creep.memory.outId = undefined;
            creep.memory.state = "gettingEnergy";
        }
    },
    getOut: function (creep) {
        let str
        if (!creep.memory.outId) {
            str = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART
            })
            if (str) {
                creep.memory.outId = str.id
            }
        }
        return creep.memory.outId
    },
    findSource: function (creep) {
        if (creep.memory.source && Game.getObjectById(creep.memory.source) && Game.getObjectById(creep.memory.source).room.name == creep.memory.target) { return }
        let source = creep.pos.findClosestByPath(FIND_SOURCES)
        if (source) {
            creep.memory.source = source.id
        }
        else {
            creep.memory.target = undefined;
        }
    },
    visualizeMap: function (room) {
        let n = room.name
        let mem = Memory.rooms[room.name]
        let v = Game.map.visual
        if (!mem.ldsEnabled) {
            return
        }
        for (let hn in mem.lds) {
            let hr = mem.lds[hn]
            v.line(rp(25, 25, n), rp(25, 25, hr), {
                lineStyle: "dotted",
                width: 5,
                color: "04ff00"
            })
            v.circle(rp(25, 25, hr), { radius: 12, strokeWidth: 0, fill: "#c9f02e" })
        }
    },
    runRoom: function (room) {
        this.checkAssigns(room);
        this.getMaintainer(room);
        this.visualizeMap(room)
    }
};

function rp(x, y, room) {
    return new RoomPosition(x, y, room)
}