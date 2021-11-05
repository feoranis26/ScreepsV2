let spawning = require("spawning")
let actions = require("creepActions")
module.exports = {
    name: "claimer"
    ,
    spawn: function (room, spawn) {
        let num = _.sum(Game.creeps, (c) => c.memory.role == "claimer")// && c.room.name == Memory.claimRoom && !c.memory.deactivated);
        //return true;
        if (!Memory.claimRoom) {
            return true
        }
        if (!Memory.claimRoom.spawners.includes(room.name)) {
            return true
        }
        let numSources = 1 * (Memory.claimRoom.state == "claim" || Memory.claimRoom.state == "constructSpawn");
        if (Memory.claimRoom.state == "constructSpawn") {
            numSources = 4
        }
        if (numSources == 0) {
            return true;
        }
        if (Memory.claimRoom.state == "claim" && num < numSources && room.energyAvailable >= Memory.rooms[room.name].energyReq) {
            if (spawn.spawnCreep([WORK, CARRY, CLAIM, MOVE, MOVE, MOVE], spawning.getName(room, "CL"), { memory: { role: "claimer" } }) == 0) {
                return false
            }
        }
        if (Memory.claimRoom.state == "constructSpawn" && num < numSources && room.energyAvailable >= Memory.rooms[room.name].energyReq) {
            if (spawn.spawnCreep([WORK, CARRY, CARRY, MOVE, MOVE, MOVE], spawning.getName(room, "CL"), { memory: { role: "claimer" } }) == 0) {
                return false
            }
        }
        if (Memory.claimRoom && num < numSources) {
            return false
        }
        return true
    },
    run: function (creep) {
        if (Memory.claimRoom) {
            if (creep.room.name != Memory.claimRoom.room) {
                actions.moveToRoomUsingHighways(creep, Memory.claimRoom.room)
            }
            else {
                let str = creep.room.controller//, { filter: (s) => s.structureType == STRUCTURE_SPAWN })
                if (str.owner == undefined) {
                    creep.moveTo(str)
                    creep.claimController(str)
                }
                else {
                    if (!Memory.claimRoom.structuresRemoved) {
                        let strs = creep.room.find(FIND_HOSTILE_STRUCTURES)
                        for (let i in strs) {
                            strs[i].destroy();
                        }
                        Memory.claimRoom.structuresRemoved = true
                        return
                    }
                    switch (creep.memory.state) {
                        default:
                            creep.memory.state = "get"
                            break;
                        case "get":
                            let source = creep.pos.findClosestByPath(FIND_SOURCES)
                            creep.moveTo(source)
                            creep.harvest(source)
                            if (creep.carry.energy == creep.carryCapacity) {
                                creep.memory.state = "give"
                            }
                            break;
                        case "give":
                            let site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)
                            if (site && str.ticksToDowngrade > 5000 && !creep.memory.upgrading) {
                                Memory.claimRoom.spawnPlaced = true
                                creep.moveTo(site)
                                creep.build(site)
                                if (creep.carry.energy == 0) {
                                    creep.memory.state = "get"
                                }
                            }
                            else {
                                if (str.ticksToDowngrade < 9900) {
                                    creep.memory.upgrading = true
                                }
                                else {
                                    creep.memory.upgrading = false;
                                }
                                creep.moveTo(str)
                                creep.upgradeController(str)
                                if (creep.carry.energy == 0) {
                                    creep.memory.state = "get"
                                }
                                if (!site) {
                                    this.nextClaimRoom();
                                    creep.memory.upgrading = false;
                                }
                            }
                    }
                }
            }
            
        }
        else {
            creep.suicide()
        }
    }, nextClaimRoom: function () {
        if (Memory.claimRooms.length > 0) {
            Memory.claimRoom = Memory.claimRooms[0]
            Memory.claimRooms.shift()
        }
    }
    , hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) }

};
