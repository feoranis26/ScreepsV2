module.exports = {
    name: "harvester"
    ,
    spawn: function (room, spawn, num) {
        let energies = Memory.rooms[room.name].energySources
        //let num = _.sum(Game.creeps, (c) => c.memory.role == "harvester" && c.room.name == room.name);
        let numSources = energies;
        if (num < numSources && room.energyAvailable >= Memory.rooms[room.name].energyReq * (_.sum(Game.creeps, (c) => c.room.name == room.name) > 2 ? 2 : 1)) {
            if (spawn.spawnCreep(require("spawning").getHarvesterBody(room.energyAvailable), require("spawning").getName(room, "HV"), { memory: { role: "harvester", target: room.name } }) == 0) {
                return false
            }
        }
        if (num < numSources) {
            return false
        }
        return true
    },
    run: function (creep) {
        if (!Memory._post) {
            Memory._post = {}
            Memory._post.harvester = {}
        }
        switch (creep.memory.state) {
            default:
                creep.memory.state = "goingToHarvest";
                break;
            case "goingToHarvest":
                this.findSrc(creep)
                break;
            case "harvesting":
                this.harvest(creep)
                this.deposit(creep)
                this.vis(creep)
                break;
        }
    },
    findSrc: function (creep) {
        if (creep.memory.sourceId) {
            if (creep.moveTo(Game.getObjectById(creep.memory.sourceId)) == -2) {
                creep.memory.sourceId = undefined;
            }
            if (creep.harvest(Game.getObjectById(creep.memory.sourceId)) == 0) {
                creep.memory.state = "harvesting";
            }
            return
        }
        let src = creep.pos.findClosestByPath(FIND_SOURCES, { filter: (s) => s.room.name == creep.room.name && _.sum(Game.creeps, (c) => c.memory.role == "harvester" && c.memory.sourceId == s.id) == 0 });
        if (src) {
            creep.memory.sourceId = src.id;
        }
        else {
            src = creep.pos.findClosestByPath(FIND_SOURCES, { filter: (s) => s.room.name == creep.room.name });
            if (src) {
                creep.memory.sourceId = src.id;
            }
        }
    },
    harvest: function (creep) {
        if (creep.harvest(Game.getObjectById(creep.memory.sourceId)) != 0) {
            creep.memory.sourceId = undefined;
            creep.memory.state = "goingToHarvest"
        };
    },
    deposit: function (creep) {
        if (!Game.getObjectById(creep.memory.container)) { creep.memory.container = undefined }
        if (creep.memory.container) {
            let cont = Game.getObjectById(creep.memory.container)
            if (creep.transfer(cont, RESOURCE_ENERGY) != 0)
                creep.memory.container = undefined;
            return
        }
        if (Game.time % 10 != 0) { return }
        let container = creep.pos.findInRange(FIND_STRUCTURES, 2, { filter: (s) => s.structureType == STRUCTURE_CONTAINER })[0]
        if (container) {
            creep.memory.container = container.id
        }
        else if (Memory.rooms[creep.room.name].inLink && Game.getObjectById(Memory.rooms[creep.room.name].inLink)) {
            let link = creep.pos.findInRange(FIND_STRUCTURES, 2, { filter: (s) => s.structureType == STRUCTURE_LINK })[0]
            if (link && link.id == Memory.rooms[creep.room.name].inLink) {
                creep.memory.container = link.id
            }
        }
    },
    vis: function (creep) {
        if (Memory._post.harvester[creep.memory.sourceId] != true) {
            Memory._post.harvester[creep.memory.sourceId] = true
            visualize(creep)
        }
    },
    runPost: function (creep) {
        Memory._post.harvester[creep.memory.sourceId] = false
    }, hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) }
};
function visualize(creep) {
    try {
        var pos
        var source
        try {
            let src = Game.getObjectById(creep.memory.sourceId);
            pos = src.pos;
            source = src;
        }
        catch {
            return
        }
        let room = creep.room.visual;
        if (pos != undefined && source != undefined) {
            room.rect(pos.x - 0.5, pos.y - 0.5, 2.25, 2, { fill: "gray", opacity: 0.25 })
            //Source visuals

            room.text("Source : ", pos.x + 1, pos.y - 0.125, { font: 0.25 });
            room.rect(pos.x + 0.5, pos.y + 0.125, 1, 0.25, { fill: "green" });
            room.rect(pos.x + 0.5, pos.y + 0.125, (1 - (source.energy / source.energyCapacity)) * 1, 0.25, { fill: "red", opacity: 1 })


            //container visuals
            source = Game.getObjectById(creep.memory.container);
            if (source) {
                room.text("Store: ", pos.x + 1, pos.y + 0.875, { font: 0.25 });
                room.rect(pos.x + 0.5, pos.y + 1.125, 1, 0.25, { fill: "red" });
                room.rect(pos.x + 0.5, pos.y + 1.125, (source.store.energy / source.store.getCapacity("energy")) * 1, 0.25, { fill: "green", opacity: 1 })
            }
        }
    }
    catch (e) {
        console.log("[Creep] <" + creep.name + ">(Harvester): Can't visualize! Error: " + e + "\nStack: " + e.stack + "\nCreep info :\nName : " + creep.name + "\nRoom : " + creep.room.name)
    }
}