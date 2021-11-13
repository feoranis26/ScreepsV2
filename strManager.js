module.exports = {
    tick: function (room) {
        //this.processPower(room)
        this.processLinks(room)
    },
    processLinks: function (room) {
        let outLink = Game.getObjectById(Memory.rooms[room.name].outLink)
        let inLink = Game.getObjectById(Memory.rooms[room.name].inLink)
        if (!outLink || !inLink) return
        room.visual.line(inLink.pos, outLink.pos, { color: "yellow", width: 0.25, opacity: 0.5 })
        inLink.transferEnergy(outLink)
    },
    processPower: function (room) {
        if (Memory.rooms[room.name].powerEnabled == false) { return }
        if (!Memory.rooms[room.name].powerSpawn) {
            let spawn = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_POWER_SPAWN })[0]
            if (spawn) {
                Memory.rooms[room.name].powerSpawn = spawn.id
                Memory.rooms[room.name].powerEnabled = true
            }
            else {
                Memory.rooms[room.name].powerEnabled = false
            }
        }
        let spawn = Game.getObjectById(Memory.rooms[room.name].powerSpawn)
        if (spawn) {
            spawn.processPower()
        }
        else {
            Memory.rooms[room.name].powerSpawn = undefined
        }
    }
};