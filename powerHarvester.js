let actions = require("creepActions")
module.exports = {
    name: "pwrh"
    ,
    spawn: function (room, spawn, num) {
        //let num = _.sum(Game.creeps, (c) => c.memory.role == this.name && c.room.name == room.name && !c.memory.deactivated);
        let numSources = 3 * Memory.actions.powerHarvesting.active;
        if (num < numSources && room.energyAvailable >= Memory.rooms[room.name].energyReq) {
            if (spawn.spawnCreep(spawning.getAttackBody(room), this.hash((Math.floor(Math.random() * 10000).toString())) + "_PW", { memory: { role: this.name, target: room.name } }) == 0) {
                return false
            }
        }
        if (num < numSources) {
            return false
        }
        return true
    }, hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) },
    run: function () {
        if (!Memory.actions.powerHarvesting.attacking) {
            if (creep.carry.power < creep.carryCapacity) {
                if (creep.room.name != Memory.actions.powerHarvesting.room) {
                    actions.moveToRoomUsingHighways(creep, Memory.actions.powerHarvesting.room);
                }
                else {
                    let resource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, { filter: (r) => r.resourceType == RESOURCE_POWER });
                    if (creep.pickup(resource, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(resource);
                    }
                    else if (creep.pickup(resource) == ERR_INVALID_TARGET) {
                        Memory.actions.powerHarvesting.active = false;
                    }
                }
            }
            else {
                if (creep.room.name != Memory.actions.powerHarvesting.deposit) {
                    actions.moveToRoomUsingHighways(creep, Memory.actions.powerHarvesting.deposit);
                }
            }
        }
        else {
            if (creep.room.name != Memory.actions.powerHarvesting.room) {
                actions.moveToRoomUsingHighways(creep, Memory.actions.powerHarvesting.room);
            }
            else {
                if (!creep.memory.powerBank) {
                    bank = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_POWER_BANK })
                    if (bank) {
                        creep.memory.powerBank = bank;
                    }
                }
                else {
                    bank = Game.getObjectById(creep.memory.powerBank)
                    if (!bank) {
                        creep.memory.powerBank = undefined;
                        creep.memory.finished = true;
                    }
                    if (creep.hits == creep.hitsMax) {
                        if (creep.attack(bank) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(bank);
                        }
                    }
                    else {
                        creep.heal(creep);
                    }
                }
            }
        }
    }
};