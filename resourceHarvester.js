let spawning = require("spawning");
const creepActions = require("./creepActions");
module.exports = {
    name: "resource"
    ,
    spawn: function (room, spawn) {
        let num = _.sum(Game.creeps, (c) => c.memory.role == "resource")// && c.room.name == Memory.claimRoom && !c.memory.deactivated);
        let numSources// = Memory.reserveRoom.length;
        if (num < numSources && room.energyAvailable > room.energyAvailable >= Memory.rooms[roomd].energyReq && Memory.actions.mining.rooms.includes(room.name)) {
            if (spawn.spawnCreep(spawning.getSpawnCreepBody(room.energyAvailable), spawning.getName(room, "RS"), { memory: { role: "resource" , target:Memory.actions.mining.room} }) == 0) {
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
                creep.memory.state = "gettingEnergy";
                break;
            case "mining":
                if (creep.store[creep.memory.resource] == creep.store.getCapacity(creep.memory.resource) || creep.ticksToLive < 250) creep.memory.state = "return"
                if (creep.room.name != Memory.resourceTarget) {
                    creepActions.moveToRoomUsingHighways(creep, Memory.resourceTarget)
                }
                else {
                    if (!Game.getObjectById(creep.memory.deposit)) {
                        creep.memory.deposit = creep.room.find(FIND_DEPOSITS).id
                    }
                    else {
                        creep.moveTo(Game.getObjectById(creep.memory.deposit))
                        creep.harvest(Game.getObjectById(creep.memory.deposit))
                    }
                }
                break;
            case "return":

                break;
        }
    }, hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) }

};
