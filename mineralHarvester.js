module.exports = {
    name: "miner"
    ,
    spawn: function (room, spawn) {
        let num = _.sum(Game.creeps, (c) => c.memory.role == "miner" && c.room.name == room.name);
        let numSources = (room.controller.level >= 6 && room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_TERMINAL }).length > 0) * 1;
        if (num < numSources && room.energyAvailable >= Memory.rooms[room.name].energyReq &&  Memory.rooms[room.name].termFull != true) {
            if (spawn.spawnCreep(require("spawning").getSpawnCreepBody(room.energyAvailable), require("spawning").getName(room, "MN"), { memory: { role: "miner", target : room.name} }) == 0) {
                return false
            }
        }
        if (num < numSources && !Memory.rooms[room.name].termFull) {
            return false
        }
        return true
    },
    run: function (creep) {
        switch (creep.memory.state) {
            default:
                creep.memory.state = "gettingMinerals";
                break;
            case "gettingMinerals":
                this.getMinerals(creep)
                break;
            case "depositing":
                this.deposit(creep)
                break
        }
    },
    getMinerals: function (creep) {
        if (!creep.memory.mineralID) {
            creep.memory.mineralID = creep.pos.findClosestByPath(FIND_MINERALS).id
        }
        mineral = Game.getObjectById(creep.memory.mineralID)
        if (creep.carry[mineral.mineralType] < creep.carryCapacity) {
            if (creep.harvest(mineral) == ERR_NOT_IN_RANGE) {
                creep.moveTo(mineral)
            }
        }
        else {
            creep.memory.state = "depositing"
            this.deposit(creep)
        }
    },
    deposit: function (creep) {
        if (!creep.memory.terminalID) {
            let term = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_TERMINAL })
            if (!term) {
                return
            }
            creep.memory.terminalID = term.id
        }
        mineral = Game.getObjectById(creep.memory.mineralID)
        terminal = Game.getObjectById(creep.memory.terminalID)
        if(terminal.store[mineral.mineralType] > 100000){
            Memory.rooms[creep.room.name].termFull = true
        }
        if (creep.carry[mineral.mineralType] > 10) {
            if (creep.transfer(terminal,mineral.mineralType) == ERR_NOT_IN_RANGE) {
                creep.moveTo(terminal)
            }
        }
        else {
            creep.memory.state = "gettingMinerals"
            this.getMinerals(creep)
        }
        
    }, hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) }
};