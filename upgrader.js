let actions = require("creepActions")
module.exports = {
    name: "upgrader"
    ,
    spawn: function (room, spawn) {
        let num = _.sum(Game.creeps, (c) => c.memory.role == "upgrader" && c.room.name == room.name);
        let numSources = 1;
        let maxEnergy = room.energyCapacityAvailable / 1.5;
        let energyReq = room.energyCapacityAvailable / 1.75;
        if (Memory.rooms[room.name].energySources > 1 && room.energyCapacityAvailable > 4000) {
            maxEnergy = 2400
            if (room.controller.level >= 6) {
                maxEnergy = room.energyCapacityAvailable / 1.25
            }
            energyReq = room.energyCapacityAvailable / 1.5;
            numSources = 2;
        }
        if (maxEnergy > 2400) {
            maxEnergy = 2400;
        }
        if (energyReq > 1800) {
            energyReq = 1800;
        }
        if (num < numSources && room.energyAvailable >= energyReq) {
            if (spawn.spawnCreep(require("spawning").getSpawnCreepBody(room.energyAvailable, maxEnergy),
                require("spawning").getName(room, "CO"),
                { memory: { role: "upgrader", target: room.name } }) == 0) {
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
                if (Game.time % 2 == 0)
                    creep.upgradeController(creep.room.controller)
                if (creep.carry.energy == creep.carryCapacity) {
                    creep.memory.sourceId = undefined;
                    creep.memory.state = "givingEnergy";
                }
                break;
            case "givingEnergy":
                creep.memory.energyIn = undefined;
                if (!creep.memory.outId) {
                    let str = creep.room.controller;
                    if (str) {
                        creep.memory.outId = str.id
                    }
                }
                if (creep.memory.outId) {
                    if (creep.upgradeController(Game.getObjectById(creep.memory.outId)) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(creep.memory.outId));
                    }
                    this.sign(creep)
                    if (creep.carry.energy == 0) {
                        creep.memory.outId = undefined;
                        creep.memory.state = "gettingEnergy";
                    }
                }
                break;
        }
    }, hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) }
    , sign: function (creep) {
        let sign = require("config").getSign(creep.room);
        if (creep.room.controller.sign) { if (creep.room.controller.sign.text == sign) { return; } }
        let signerr = creep.signController(Game.getObjectById(creep.memory.outId), sign)
        if (signerr == ERR_NOT_IN_RANGE) {
            creep.moveTo(Game.getObjectById(creep.memory.outId));
        }
    }
};