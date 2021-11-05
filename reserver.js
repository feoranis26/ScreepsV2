let spawning = require("spawning")
module.exports = {
    name: "reserver"
    ,
    spawn: function (room, spawn, num) {
        if (!Memory.rooms[room.name].reservation) {
            return true;
        }
        //let num = _.sum(Game.creeps, (c) => c.memory.role == "reserver")// && c.room.name == Memory.claimRoom && !c.memory.deactivated);
        let numSources = Memory.rooms[room.name].reservation.length;
        if (num < numSources) {
            spawn.spawnCreep([CLAIM, MOVE], this.hash((Math.floor(Math.random() * 10000).toString())) + "_RS", { memory: { role: "reserver", home: room.name } })
            return false
        }
        else {
            return true;
        }
    },
    run: function (creep) {
        if (!creep.memory.room) {
            for (let roomn in Memory.rooms[creep.room.name].reservation) {
                let creeps = _.sum(Game.creeps, (c) => c.memory.role == "reserver" && c.memory.room == roomn)
                if (creeps == 0) {
                    creep.memory.room = Memory.rooms[creep.room.name].reservation[roomn];
                }
            }
        }
        if (Game.time % 5 == 0) {
            if (Memory.actions.ldsDangerous[creep.memory.room]) {
                creep.memory.run = true
            }
            else {
                creep.memory.run = false
            }
        }
        if (!creep.memory.run) {
            if (creep.room.name != creep.memory.room) {
                exit = creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.room));
                creep.moveTo(exit)
            }
            else {
                let str = creep.room.controller//, { filter: (s) => s.structureType == STRUCTURE_SPAWN })
                creep.reserveController(str)
                creep.moveTo(str)
            }
        }
        else {
            exit = creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.home));
            creep.moveTo(exit)
        }
    }, hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) }

};
