module.exports = {
    name: "medic"
    ,
    spawn: function (room, spawn) {
        let num = _.sum(Game.creeps, (c) => c.memory.role == "medic" && c.room.name == room.name && !c.memory.deactivated);
        let numSources = _.sum(Game.creeps, (c) => c.memory.role == "melee" && c.room.name == room.name && !c.memory.deactivated) * 1 * Memory.rooms[room.name].critical;
        if (num < numSources && room.energyAvailable >= Memory.rooms[room.name].energyReq) {
            if (spawn.spawnCreep([TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL], require("spawning").getName(room, "HE"), { memory: { role: "medic", target: room.name } }) == 0) {
                return false
            }
        }
        if (num < numSources) {
            return false
        }
        return true
    },
    run: function (creep) {
        if (!creep.memory.melee) {
            let closestMelee = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                filter: (c) => {
                    if (c.memory.role == "melee") {
                        let medic = creep.pos.findClosestByPath(FIND_MY_CREEPS, { filter: (c2) => c2.memory.role == "medic" && c2.memory.melee == c.id })
                        if (!medic) {
                            return true;
                        }
                    }
                }
            })
            if (closestMelee) {
                creep.memory.melee = closestMelee.id;
            }
        } else {
            creep.heal(creep);
            if (creep.hits < creep.hitsMax / 2) return;
            let closestMelee = Game.getObjectById(creep.memory.melee)
            if (closestMelee) {
                creep.moveTo(closestMelee);
                if (creep.heal(closestMelee) != 0) {
                    creep.heal(creep);
                }

            }
            else {
                creep.memory.melee = undefined
            }
        }
    }, hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) }
};