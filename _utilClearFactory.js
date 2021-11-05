module.exports = {
    name: "clearfactory",
    suffix: "_CF",
    amount: 1
    ,
    spawn: function (room, spawn) {
        if (room.name != "W59S49") {
            return true;
        }
        let num = _.sum(Game.creeps, (c) => c.memory.role == this.name && c.room.name == room.name && !c.memory.deactivated);
        let numSources = this.amount;
        if (num < numSources && room.energyAvailable >= Memory.rooms[room.name].energyReq || (Memory.rooms[room.name].critical && num < 3)) {
            if (spawn.spawnCreep(require("spawning").getCarrierBody(room.energyAvailable), this.hash((Math.floor(Math.random() * 10000).toString())) + this.suffix, { memory: { role: this.name, target: room.name } }) == 0) {
                return false
            }
        }
        if (num < numSources) {
            return false
        }
        return true
    }, hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) },
    run: function (creep) {
        let factory = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_FACTORY })
        let storage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_STORAGE })
        if (creep.memory.getting) {
            if (creep.carry.energy >= creep.carryCapacity) {
                creep.memory.getting = false;
            }
            creep.moveTo(factory);
            creep.withdraw(factory, RESOURCE_ENERGY)
        }
        else {
            if (creep.carry.energy == 0) {
                creep.memory.getting = true;
            }
            creep.moveTo(storage);
            creep.transfer(storage, RESOURCE_ENERGY);
        }
    }
};