let actions = require("creepActions")
module.exports = {
    name: "carrier"
    ,
    spawn: function (room, spawn) {
        let num = _.sum(Game.creeps, (c) => c.memory.role == "carrier" && c.room.name == room.name);
        let numSources = 1 * _.sum(Game.creeps, (c) => c.memory.role == "harvester" && c.room.name == room.name) + 1;
        if (numSources > 2) {
            numSources = 2;
        }
        if (num < numSources && room.energyAvailable >= Memory.rooms[room.name].energyReq) {
            if (spawn.spawnCreep(require("spawning").getCarrierBody(room.energyAvailable), require("spawning").getName(room, "CR"), { memory: { role: "carrier", target: room.name } }) == 0) {
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
                if (!actions.getEnergy(creep) && creep.carry.energy > 0) {
                    creep.memory.state = "givingEnergy"
                    this.giveOut(creep)
                    this.getOut(creep)
                }
                if (creep.carry.energy == creep.carryCapacity) {
                    creep.memory.sourceId = undefined;
                    creep.memory.state = "givingEnergy";
                    this.giveOut(creep)
                    this.getOut(creep)
                }
                break;
            case "givingEnergy":
                creep.memory.energyIn = undefined;
                this.giveOut(creep)
                this.getOut(creep)
                if (creep.carry.energy == 0) {
                    creep.memory.outId = undefined;
                    creep.memory.state = "gettingEnergy";
                    actions.getEnergy(creep)
                }
                break;
        }
    }, hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) },
    getOut: function (creep) {
        if(Game.time % 5 != 0 && Game.cpu.bucket < 1000){ return}
        if (!creep.memory.outId) {
            let str = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: (s) => { if (s.store != undefined) { return s.store.energy < s.store.getCapacity(RESOURCE_ENERGY) && s.structureType != STRUCTURE_FACTORY && s.structureType != STRUCTURE_TERMINAL && s.store.energy < 25000 && s.structureType != STRUCTURE_LINK && s.structureType != STRUCTURE_STORAGE} } });
            if ((!str || creep.room.energyAvailable > 10000) && creep.memory.energyInType != "stor") {
                str = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: (s) => { if (s.store != undefined) { return s.store.energy < 300000 && s.store.energy < s.store.getCapacity("energy") } } });
            }
            if (str) {
                creep.memory.outId = str.id
            }
        }
    },
    giveOut: function (creep) {
        if (creep.memory.outId) {
            let out = Game.getObjectById(creep.memory.outId)
            creep.room.visual.circle(out.pos, { radius: 0.5 , fill: 'transparent', strokeWidth : 0.1, stroke : "lightblue"})
            if (creep.transfer(out, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(out);
            }
            else if (creep.transfer(out, RESOURCE_ENERGY) != 0) {
                creep.memory.outId = undefined;
            }
        }
    }
};