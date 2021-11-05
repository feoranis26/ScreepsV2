module.exports = {
    name: "demo",
    suffix: "DM",
    amount: 1
    ,
    spawn: function (room, spawn) {
        let num = _.sum(Game.creeps, (c) => c.memory.role == this.name && c.room.name == room.name && !c.memory.deactivated);
        let numSources = this.amount;
        if (num < numSources && room.energyAvailable >= Memory.rooms[room.name].energyReq || (Memory.rooms[room.name].critical && num < 3)) {
            if (spawn.spawnCreep(spawning.getAttackBody(room), spawning.getName(room, this.suffix), { memory: { role: this.name, target: room.name } }) == 0) {
                return false
            }
        }
        if (num < numSources) {
            return false
        }
        return true
    }, hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) },
    run: function () {
        
    }
};