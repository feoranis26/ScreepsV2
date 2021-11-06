let actions = require("creepActions")
module.exports = {
    name: "wallrep"
    ,
    spawn: function (room, spawn, num) {
        let numSources = 2;
        if (num < numSources && room.energyAvailable >= Memory.rooms[room.name].energyReq) {
            if (spawn.spawnCreep(require("spawning").getSpawnCreepBody(room.energyAvailable), require("spawning").getName(room, "WA"), { memory: { role: "wallrep", target: room.name } }) == 0) {
                return false
            }
        }
        if (num < numSources) {
            return false
        }
        return true
    },
    run: function (creep) {
        //if(creep.room.name == "W29S16"){
        switch (creep.memory.state) {
            default:
                creep.memory.state = "gettingEnergy";
                break;
            case "gettingEnergy":
                actions.getEnergy(creep)
                if (creep.carry.energy == creep.carryCapacity) {
                    creep.memory.sourceId = undefined;
                    creep.memory.state = "givingEnergy";
                }
                break;
            case "givingEnergy":
                creep.memory.energyIn = undefined;
                if (!creep.memory.str) {
                    if (Game.time %15!= 0) {
                        return
                    }
                    let target = creep.room.find(FIND_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART});
                    target = _.min(target, (s)=>s.hits)
                    if (target) {
                        creep.memory.str = target.id;
                    }
                }
                else {
                    let target = Game.getObjectById(creep.memory.str);
                    let counter = creep.memory.counter;
                    if (counter % 20 == 0) {
                        creep.memory.str = undefined;
                        creep.memory.counter = 1;
                    }
                    else {
                        if (target != undefined) {
                            if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target);
                            }
                            else if (creep.repair(target) == ERR_INVALID_TARGET) {
                                creep.memory.str = undefined;
                            }
                            else if (creep.repair(target) == 0) {
                                creep.memory.counter++
                            }
                        }
                        else {
                            creep.memory.str = undefined;
                        }/*
                        if (target && creep.memory._move.path) {
                            let path = Room.deserializePath(creep.memory._move.path);
                            creep.room.visual.poly(path, { stroke: "red", lineStyle: 'dotted', opacity: 0.1 });
                            creep.room.visual.circle(target.pos, { radius: 0.5, fill: 'transparent', strokeWidth: 0.1, stroke: "lightblue" })
                            creep.room.visual.text("🏗", target.pos.x, target.pos.y + 1);
                        }*/
                        if (creep.carry.energy == 0) {
                            creep.memory.outId = undefined;
                            creep.memory.state = "gettingEnergy";
                        }

                    }
                }
                break;
            // }
        }
    }, hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) }
};
