module.exports = {
    name: "roomrev"
    ,
    spawn: function (room, spawn, roomType) {
        if (roomType == "dead") {
            spawn.spawnCreep(require("spawning").getSpawnCreepBody(room.energyAvailable), require("spawning").getName(room, "RO"), { memory: { role: "roomrev", target: room.name } })
            return false
        }
        else {
            return true;
        }
    },
    run: function (creep) {
        switch (creep.memory.state) {
            default:
                creep.memory.state = "gettingEnergy";
                break;
            case "gettingEnergy":
                let source = creep.pos.findClosestByPath(FIND_SOURCES)
                creep.harvest(source)
                creep.moveTo(source)
                if (creep.carry.energy == creep.carryCapacity) {
                    creep.memory.sourceId = undefined;
                    creep.memory.state = "givingEnergy";
                }
                break;
            case "givingEnergy":
                let out = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => {
                        if(!s.store){return false}
                        return (s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN) && (s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY))
                    }
                })
                creep.moveTo(out)
                creep.transfer(out, RESOURCE_ENERGY)
                if (creep.carry.energy == 0) {
                    creep.memory.outId = undefined;
                    creep.memory.state = "gettingEnergy";
                }
                break;
        }
    }, hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) }
};