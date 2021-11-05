module.exports = {
    checkRoom: function (room) {
        if (!room) { return false }
        let squads = Memory.defense.squads
        let roomMem = Memory.rooms[room.name].squad
        if (roomMem) {
            if (roomMem.isAssembling) {
                let numMelee = _.sum(Game.creeps, (c) => c.memory.role == "melee" && squads[roomMem.squadID].members.includes(c.id));
                let numRanged = _.sum(Game.creeps, (c) => c.memory.role == "ranged" && squads[roomMem.squadID].members.includes(c.id));
                if (numMelee >= roomMem.targetMelee && numRanged >= roomMem.targetRanged) {
                    squads[roomMem.squadID].ready = true
                    this.cleanupRoomMemory(room)
                }
            }
        } else {
            this.setupRoomMem(room)
        }
    },
    setupRoomMem: function (room) {
        Memory.rooms[room.name].squad = {}
        let roomMem = Memory.rooms[room.name].squad
        roomMem.isAssembling = false
        roomMem.targetMelee = 0
        roomMem.targetRanged = 0
        roomMem.members = []
    },
    cleanupRoomMemory: function (room) {
        let roomMem = Memory.rooms[room.name].squad
        roomMem.isAssembling = false
        roomMem.targetMelee = 0
        roomMem.targetRanged = 0
    },
    assembleSquad: function (m, r, mode, room) {
        if ((m == 0 && r == 0) || (mode != "DEFEND" && mode != "ATTACK") || (!room)) {
            return -1
        }
        let squads = Memory.defense.squads
        let roomMem = Memory.rooms[room.name].squad

        let squad = {}

        roomMem.targetMelee = m
        roomMem.targetRanged = r
        roomMem.isAssembling = true
        roomMem.squadID = squads.length

        squad.target = room.name
        squad.ready = false
        squad.mode = mode
        squad.members = []
        squad.assembler = room.name


        squads.push(squad)
        return 0
    },
    isAssemblyComplete: function (room) {
        if (!room) { return false }

        let squads = Memory.defense.squads
        let roomMem = Memory.rooms[room.name].squad

        let numMelee = _.sum(Game.creeps, (c) => c.memory.role == "melee" && squads[roomMem.squadID].members.includes(c.id));
        let numRanged = _.sum(Game.creeps, (c) => c.memory.role == "ranged" && squads[roomMem.squadID].members.includes(c.id));

        return numMelee >= roomMem.targetMelee && numRanged >= roomMem.targetRanged
    },
    isAssembling: function (room) {
        let roomMem = Memory.rooms[room.name].squad
        return roomMem.isAssembling
    },
    disbandSquad: function (squad) {
        squad = null
    }
}