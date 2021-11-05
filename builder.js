let actions = require("creepActions")
module.exports = {
    name: "builder"
    ,
    spawn: function (room, spawn, num) {
        //let num = _.sum(Game.creeps, (c) => c.memory.role == "builder" && c.memory.home == room.name);
        let numSources = 1;
        if (num < numSources && room.energyAvailable >= Memory.rooms[room.name].energyReq) {
            if (spawn.spawnCreep(require("spawning").getSpawnCreepBody(room.energyAvailable), require("spawning").getName(room, "BL"), { memory: { role: "builder", target: room.name, home: room.name } }) == 0) {
                return false
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
            case "gettingEnergy":
                if (creep.room.name != creep.memory.home) {
                    exit = creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.home));
                    creep.moveTo(exit)
                }
                else {
                    actions.getEnergy(creep)
                    if (creep.carry.energy == creep.carryCapacity) {
                        creep.memory.sourceId = undefined;
                        creep.memory.energyIn = undefined;
                        creep.memory.state = "givingEnergy";
                        creep.room.visual.text("🏗", creep.pos);
                    }
                }
                break;
            case "givingEnergy":
                if (creep.room.name != creep.memory.target) {
                    if (!creep.memory.target) {
                        creep.memory.target = creep.room.name
                    }
                    exit = creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.target));
                    creep.moveTo(exit)
                }
                else {
                    if (this.repairJustBuiltStructure(creep)) { return }

                    this.getConstructionSite(creep)
                    this.build(creep)


                    if (creep.carry.energy == 0) {
                        creep.memory.outId = undefined;
                        creep.memory.state = "gettingEnergy";
                        creep.room.visual.text("🔋", creep.pos);
                    }
                    if (creep.memory.outId != undefined) {
                        let path = Room.deserializePath(creep.memory._move.path);
                        creep.room.visual.poly(path, { stroke: "yellow", lineStyle: 'dashed', opacity: 0.1 });
                        creep.room.visual.circle(Game.getObjectById(creep.memory.outId).pos, { radius: 0.5, fill: 'transparent', strokeWidth: 0.1, stroke: "lightblue" })
                        creep.room.visual.text("🏗", Game.getObjectById(creep.memory.outId).pos.x, Game.getObjectById(creep.memory.outId).pos.y + 1);
                    }
                }
                break;
        }
    },
    repairJustBuiltStructure: function (creep) {
        if (creep.memory.justBuiltPos) {
            let look = creep.room.lookAt(creep.memory.justBuiltPos.x, creep.memory.justBuiltPos.y)
            for (let lookObjN in look) {
                let lookObj = look[lookObjN]
                if (lookObj.structure) {
                    creep.memory.justBuilt = lookObj.structure.id
                    creep.memory.justBuiltPos = undefined
                }
            }
        }
        if (creep.memory.justBuilt) {
            let built = Game.getObjectById(creep.memory.justBuilt)
            if (!built) {
                creep.memory.justBuilt = undefined
            }
            if (built.hits < 1000) {
                creep.repair(built)
                creep.moveTo(built)
            }
            else {
                creep.memory.justBuilt = undefined
            }
            return true
        }
        return false
    },
    getConstructionSite: function (creep) {
        if (!creep.memory.outId) {
            let str = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, { filter: (s) => s.room.name == creep.memory.target });
            if (str) {
                creep.memory.outId = str.id
            }
            else {
                this.changeRoom(creep)
            }
        }
    },
    build: function (creep) {
        if (creep.memory.outId) {
            if (creep.build(Game.getObjectById(creep.memory.outId), RESOURCE_ENERGY) == 0) {
                creep.memory.justBuiltPos = Game.getObjectById(creep.memory.outId).pos
            }
            else if (creep.build(Game.getObjectById(creep.memory.outId), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.outId));
            }
            else if (creep.build(Game.getObjectById(creep.memory.outId), RESOURCE_ENERGY) == ERR_INVALID_TARGET) {
                creep.memory.outId = undefined
            }

        }
    },
    changeRoom: function (creep) {
        if (!creep.memory.home) { creep.memory.home = creep.room.name }
        if (Memory.rooms[creep.memory.home].constructionSupport)
            creep.memory.target = Memory.rooms[creep.memory.home].constructionSupport
    }
};