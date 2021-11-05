let spawning = require("spawning")
module.exports = {
    name: "powerProcessor",
    suffix: "PW",
    amount: 1
    ,
    spawn: function (room, spawn, num) {
        //let num = _.sum(Game.creeps, (c) => c.memory.role == this.name && c.room.name == room.name && !c.memory.deactivated);
        let term = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_TERMINAL })[0]
        if (!term) {
            return true
        }
        let numSources = this.amount * term.store.power > 0;
        if (num < numSources && room.energyAvailable >= Memory.rooms[room.name].energyReq) {
            if (spawn.spawnCreep([CARRY, CARRY, MOVE], spawning.getName(room, this.suffix), { memory: { role: this.name, target: room.name } }) == 0) {
                return false
            }
        }
        if (num < numSources) {
            return false
        }
        return true
    }, hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) },
    run: function (creep) {
        if (!creep.memory.term) {
            creep.memory.term = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_TERMINAL }).id
        }
        if (!creep.memory.spawn) {
            creep.memory.spawn = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_POWER_SPAWN }).id
        }
        let spawn = Game.getObjectById(creep.memory.spawn)
        if ((!creep.memory.state) && spawn.store.power == 0 && spawn.store.energy == 5000) {
            let term = Game.getObjectById(creep.memory.term)
            creep.moveTo(term)
            creep.withdraw(term, RESOURCE_POWER)
            if (creep.store.power > 0) {
                creep.memory.state = true;
            }
        }
        else {
            creep.moveTo(spawn)
            creep.transfer(spawn, RESOURCE_POWER)
            if (creep.store.power == 0 && spawn.store.power == 0 && spawn.store.energy == 5000) {
                creep.memory.state = false;
            }
        }
    }
};