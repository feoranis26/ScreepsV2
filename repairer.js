let actions = require("creepActions")
module.exports = {
    name: "repairer"
    ,
    spawn: function (room, spawn) {
        let num = _.sum(Game.creeps, (c) => c.memory.role == "repairer" && c.room.name == room.name);
        let numSources = 1;
        if (num < numSources && room.energyAvailable >= Memory.rooms[room.name].energyReq) {
            if (spawn.spawnCreep(require("spawning").getSpawnCreepBody(room.energyAvailable), require("spawning").getName(room, "RE"), { memory: { role: "repairer", target : room.name} }) == 0) {
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
                actions.getEnergy(creep)
                if (creep.carry.energy == creep.carryCapacity) {
                    creep.memory.sourceId = undefined;
                    creep.memory.state = "givingEnergy";
                }
                break;
            case "givingEnergy":
                creep.memory.energyIn = undefined;
                let str = Game.getObjectById(this.getOut(creep))
                if(str) {
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
                    creep.room.visual.poly(path, { stroke: "orange", lineStyle: 'dashed', opacity : 0.1 });
                    creep.room.visual.circle(str.pos, { radius: 0.5 , fill: 'transparent', strokeWidth : 0.1, stroke : "lightblue"})
                    creep.room.visual.text("🏗", str.pos.x, str.pos.y + 1);
                }
                if (creep.carry.energy == 0) {
                    creep.memory.outId = undefined;
                    creep.memory.state = "gettingEnergy";
                }
                break;
        }
    }, hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) },
    getOut: function (creep) {
        let str
        if (!creep.memory.outId && Game.time % 5 == 0) {
            str = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART
            })
            if (str) {
                creep.memory.outId = str.id
            }
        }
        return creep.memory.outId
    }
};