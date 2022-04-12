let spawning = require("spawning");
const creepActions = require("./creepActions");
module.exports = {
    name: "resource"
    ,
    spawn: function (room, spawn) {
        let num = _.sum(Game.creeps, (c) => c.memory.role == "resource" && c.memory.home == room.name)// && c.room.name == Memory.claimRoom && !c.memory.deactivated);
        let numSources = Memory.rhv[room.name] != null ? 1 : 0// = Memory.reserveRoom.length;
        if (num < numSources && room.energyAvailable >= Memory.rooms[room.name].energyReq * 4) {
            if (spawn.spawnCreep(spawning.getSpawnCreepBody(room.energyAvailable, 3200), spawning.getName(room, "RS"), { memory: { role: "resource" , target: Memory.rhv[room.name].target, home : room.name, resource : RESOURCE_METAL} }) == 0) {
                return true
            }
        }
        if (num < numSources) {
            return false
        }
        return true
    },
    run: function (creep) {
        switch (creep.memory.state) {
            default:
                creep.memory.state = "mining";
                break;
            case "mining":
                if (creep.store[creep.memory.resource] == creep.store.getCapacity(creep.memory.resource) || creep.ticksToLive < 350) creep.memory.state = "return"
                if (creep.room.name != creep.memory.target) {
                    creepActions.moveToRoomUsingHighways(creep, creep.memory.target)
                }
                else {
                    if (!Game.getObjectById(creep.memory.deposit)) {
                        creep.memory.deposit = creep.pos.findClosestByPath(FIND_DEPOSITS).id
                    }
                    else {
                        creep.moveTo(Game.getObjectById(creep.memory.deposit))
                        creep.harvest(Game.getObjectById(creep.memory.deposit))
                    }
                }
                break;
            case "return":
                if (creep.store[creep.memory.resource] == 0) creep.memory.state = "mining"
                if (creep.room.name != creep.memory.home) {
                    creepActions.moveToRoomUsingHighways(creep, creep.memory.home)
                }
                else {
                    if (!Game.getObjectById(creep.memory.storage)) {
                        creep.memory.storage = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_STORAGE }).id
                    }
                    else {
                        creep.moveTo(Game.getObjectById(creep.memory.storage))
                        creep.transfer(Game.getObjectById(creep.memory.storage), creep.memory.resource)
                    }
                }
                break;
        }
    }, hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) }

};
