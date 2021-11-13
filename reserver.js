let spawning = require("spawning")
module.exports = {
    name: "reserver"
    ,
    spawn: function (room, spawn) {
        if (!Memory.rooms[room.name].reservation) {
            return true;
        }
        let num = _.sum(Game.creeps, (c) => c.memory.role == "reserver")// && c.room.name == Memory.claimRoom && !c.memory.deactivated);
        let numSources = Memory.rooms[room.name].reservation.length;
        if (num < numSources) {
            spawn.spawnCreep([CLAIM, CLAIM, MOVE, MOVE], this.hash((Math.floor(Math.random() * 10000).toString())) + "_RS", { memory: { role: "reserver", home: room.name } })
            return false
        }
        else {
            return true;
        }
    },
    run: function (creep) {
        if (!creep.memory.room) {
            for (let roomn in Memory.rooms[creep.memory.home].reservation) {
                let roomname = Memory.rooms[creep.memory.home].reservation[roomn]
                let creeps = _.sum(Game.creeps, (c) => c.memory.role == "reserver" && c.memory.room == roomname)
                if (creeps == 0) {
                    creep.memory.room = roomname;
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
                if (creep.reserveController(str) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(str)
                    let path = Room.deserializePath(creep.memory._move.path);
                    creep.room.visual.poly(path, { stroke: "purple", lineStyle: 'dashed', opacity: 0.1 });
                }
            }
        }
        else {
            exit = creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.home));
            creep.moveTo(exit)
            if (creep.memory._move) {
                let path = Room.deserializePath(creep.memory._move.path);
                creep.room.visual.poly(path, { stroke: "purple", lineStyle: 'dashed', opacity: 0.1 });
            }
        }
    }, hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) }

};
