let spawning = require("spawning")
let cfx = require("creepActions")
module.exports = {
    name: "melee"
    ,
    spawn: function (room, spawn) {
        let ldsNeedsSupport = false;
        for (let room2 in Memory.actions.ldsDangerous) {
            if (Memory.actions.ldsDangerous[room2] && Memory.rooms[room.name] && Memory.rooms[room.name].lds && Memory.rooms[room.name].lds.includes(room2)) {
                ldsNeedsSupport = true;
            }
        }

        if (!Memory.rooms[room.name].squad || Memory.rooms[room.name].squad.targetMelee == 0) return !ldsNeedsSupport

        let num = _.sum(Game.creeps, (c) => c.memory.role == "melee" && c.home.name == room.name);
        let numSources = Memory.rooms[room.name].squad.targetMelee + ldsNeedsSupport ? 0 : 1;

        let energyReq = Memory.rooms[room.name].energyReq * 3

        if (num < numSources && room.energyAvailable >=  energyReq/*|| (Memory.rooms[room.name].critical && num < 2)*/) {
            if (spawn.spawnCreep(spawning.getAttackBody(room), spawning.getName(room, "ME"), { memory: { role: "melee", home: room.name } }) == 0) {
                return false
            }
        }

        return num >= numSources
    },
    run: function (creep) {
        this.checkNearbyLDSRooms(creep)
        if (creep.room.name != creep.memory.home && !Game.getObjectById(creep.memory.target)) {
            this.moveToHome(creep)
        }
        else {
            this.checkSquads(creep)
            this.checkPatrolPos(creep)
            this.doAttack(creep)
        }
    },
    checkNearbyLDSRooms: function (creep) {
        if (Game.time % 5 != 0) {
            for (let room in Memory.actions.ldsDangerous) {
                if (Memory.actions.ldsDangerous[room] && Memory.rooms[creep.room.name] && Memory.rooms[creep.room.name].lds && Memory.rooms[creep.room.name].lds.includes(room)) {
                    creep.memory.home = room
                    creep.memory.patrolPos = undefined;
                }
            }
        }
        if (Memory.actions.ldsDangerous[creep.room.name]) {
            if (Game.time % 5 != 0 && creep.room.name == creep.memory.home) {
                let hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
                if (hostiles.length > 0) {
                    Memory.actions.ldsDangerous[creep.memory.home] = true;
                }
                else {
                    Memory.actions.ldsDangerous[creep.memory.home] = false;
                }
            }
        }
    },
    moveToHome: function (creep) {
        let xit_dir = creep.room.findExitTo(creep.memory.home)
        let xit = creep.pos.findClosestByPath(xit_dir)
        creep.moveTo(xit)
    },
    checkPatrolPos: function (creep) {
        if(creep.memory.squadID) { return }
        if (creep.memory.patrolPos && !Game.getObjectById(creep.memory.target)) {
            creep.moveTo(creep.memory.patrolPos.x, creep.memory.patrolPos.y);
        }
        else if (Game.time % 10 == 0) {
            this.getPatrol(creep)
        }
    },
    doAttack: function (creep) {
        let hostile = creep.room.find(FIND_HOSTILE_CREEPS)
        if (hostile.length == 0)
            return;
        let creepTarget = Game.getObjectById(creep.memory.target)
        //console.log(creepTarget)
        this.getTarget(creep)
        //if (!creep.memory.patrolPos) {
            creep.moveTo(creepTarget)
        //}
        creep.attack(creepTarget)

    },
    getTarget: function (creep) {
        for (let name in Memory.defense.towersAttacking) {
            let hostile = Game.getObjectById(Memory.defense.towersAttacking[name])
            //console.log(hostile)
            if (creep.attack(hostile) == 0) {
                creep.memory.target = hostile.id
                return;
            }
        }
        let hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, { filter: (c) => c.room.name == creep.memory.home })
        if (hostile) {
            creep.memory.target = hostile.id
        }
    }, hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) },
    getPatrol: function (creep) {
        if (!creep.memory.patrol) {
            let toppers = _.sum(Game.creeps, (c) => c.memory.role == "melee" && c.room.name == creep.room.name && c.memory.patrol == "TOP");
            let lefters = _.sum(Game.creeps, (c) => c.memory.role == "melee" && c.room.name == creep.room.name && c.memory.patrol == "LEFT");
            let bottomers = _.sum(Game.creeps, (c) => c.memory.role == "melee" && c.room.name == creep.room.name && c.memory.patrol == "BOTTOM");
            let righters = _.sum(Game.creeps, (c) => c.memory.role == "melee" && c.room.name == creep.room.name && c.memory.patrol == "RIGHT");
            let clearAreaNeeded = 23
            let source = { pos: new RoomPosition(25, 25, creep.room.name) }
            let topC = false
            let leftC = false
            let downC = false
            let rightC = false
            let room = creep.room
            for (let x = source.pos.x - clearAreaNeeded; x < source.pos.x + clearAreaNeeded; x++) {
                let y = source.pos.y - clearAreaNeeded
                let terrain = room.lookAt(x, y)
                for (let i = 0; i < terrain.length; i++) {
                    let terrainObj = terrain[i]
                    if (terrainObj.type == "structure") {
                        if (terrainObj.structure.structureType == STRUCTURE_RAMPART) {
                            topC = true
                            break;
                        }
                    }
                }
            }
            for (let y = source.pos.y - clearAreaNeeded + 1; y < source.pos.y + clearAreaNeeded; y++) {
                let x = source.pos.x - clearAreaNeeded
                let terrain = room.lookAt(x, y)
                //room.visual.rect(x - 0.5,y - 0.5, 1, 1)
                for (let i = 0; i < terrain.length; i++) {
                    let terrainObj = terrain[i]
                    if (terrainObj.type == "structure") {
                        if (terrainObj.structure.structureType == STRUCTURE_RAMPART) {
                            leftC = true
                            break;
                        }
                    }
                }
            }
            clearAreaNeeded -= 1
            for (let y = source.pos.y - clearAreaNeeded; y < source.pos.y + clearAreaNeeded; y++) {
                let x = source.pos.x + clearAreaNeeded
                room.visual.rect(x - 0.5, y - 0.5, 1, 1)
                let terrain = room.lookAt(x, y)
                for (let i = 0; i < terrain.length; i++) {
                    let terrainObj = terrain[i]
                    if (terrainObj.type == "structure") {
                        if (terrainObj.structure.structureType == STRUCTURE_RAMPART) {
                            rightC = true
                            break;
                        }
                    }
                }
            }
            for (let x = source.pos.x - clearAreaNeeded; x < source.pos.x + clearAreaNeeded + 1; x++) {
                let y = source.pos.y + clearAreaNeeded
                let terrain = room.lookAt(x, y)
                for (let i = 0; i < terrain.length; i++) {
                    let terrainObj = terrain[i]
                    if (terrainObj.type == "structure") {
                        if (terrainObj.structure.structureType == STRUCTURE_RAMPART) {
                            downC = true
                        }
                    }
                }
            }
            if (topC && toppers == 0) {
                let exit = creep.room.find(FIND_EXIT_TOP)[0]
                if (exit) {
                    creep.memory.patrol = "TOP";
                }
            }
            if (leftC && lefters == 0) {
                let exit = creep.room.find(FIND_EXIT_LEFT)[0]
                if (exit) {
                    creep.memory.patrol = "LEFT";
                }
            }
            if (downC && bottomers == 0) {
                let exit = creep.room.find(FIND_EXIT_BOTTOM)[0]
                if (exit) {
                    creep.memory.patrol = "BOTTOM";
                }
            }
            if (rightC && righters == 0) {
                let exit = creep.room.find(FIND_EXIT_RIGHT)[0]
                if (exit) {
                    creep.memory.patrol = "RIGHT";
                }
            }
        }
        else if (!creep.memory.patrolPos) {
            creep.memory.patrolPos = this.GetPatrolPosForCreep(creep)
        }
    },
    GetPatrolPosForCreep: function (creep) {
        let clearAreaNeeded = 23
        let source = { pos: new RoomPosition(25, 25, creep.room.name) }
        let positions = []
        let room = creep.room
        let spawn = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_SPAWN })[0]
        switch (creep.memory.patrol) {
            case "TOP":
                for (let x = source.pos.x - clearAreaNeeded; x < source.pos.x + clearAreaNeeded; x++) {
                    let y = source.pos.y - clearAreaNeeded
                    let terrain = room.lookAt(x, y)
                    for (let i = 0; i < terrain.length; i++) {
                        let terrainObj = terrain[i]
                        if (terrainObj.type == "structure") {
                            if (terrainObj.structure.structureType == STRUCTURE_RAMPART) {
                                room.visual.rect(x - 0.5, y - 0.5, 1, 1)
                                positions.push(new RoomPosition(x, y, room.name))
                            }
                        }
                    }
                }
                break;
            case "LEFT":
                for (let y = source.pos.y - clearAreaNeeded + 1; y < source.pos.y + clearAreaNeeded; y++) {
                    let x = source.pos.x - clearAreaNeeded
                    let terrain = room.lookAt(x, y)
                    //room.visual.rect(x - 0.5,y - 0.5, 1, 1)
                    for (let i = 0; i < terrain.length; i++) {
                        let terrainObj = terrain[i]
                        if (terrainObj.type == "structure") {
                            if (terrainObj.structure.structureType == STRUCTURE_RAMPART) {
                                room.visual.rect(x - 0.5, y - 0.5, 1, 1)
                                positions.push(new RoomPosition(x, y, room.name))
                            }
                        }
                    }
                }
                break;
            case "RIGHT":
                clearAreaNeeded = clearAreaNeeded - 1
                for (let y = source.pos.y - clearAreaNeeded; y < source.pos.y + clearAreaNeeded; y++) {
                    let x = source.pos.x + clearAreaNeeded
                    room.visual.rect(x - 0.5, y - 0.5, 1, 1)
                    let terrain = room.lookAt(x, y)
                    for (let i = 0; i < terrain.length; i++) {
                        let terrainObj = terrain[i]
                        if (terrainObj.type == "structure") {
                            if (terrainObj.structure.structureType == STRUCTURE_RAMPART) {
                                room.visual.rect(x - 0.5, y - 0.5, 1, 1)
                                positions.push(new RoomPosition(x, y, room.name))
                            }
                        }
                    }
                }
                break;
            case "BOTTOM":
                clearAreaNeeded = clearAreaNeeded - 1
                for (let x = source.pos.x - clearAreaNeeded; x < source.pos.x + clearAreaNeeded + 1; x++) {
                    let y = source.pos.y + clearAreaNeeded
                    let terrain = room.lookAt(x, y)
                    for (let i = 0; i < terrain.length; i++) {
                        let terrainObj = terrain[i]
                        if (terrainObj.type == "structure") {
                            if (terrainObj.structure.structureType == STRUCTURE_RAMPART) {
                                room.visual.rect(x - 0.5, y - 0.5, 1, 1)
                                positions.push(new RoomPosition(x, y, room.name))
                            }
                        }
                    }
                }
                break;
        }
        for (let i in positions) {
            let pos = positions[i]
            room.visual.rect(pos.x - 0.5, pos.y - 0.5, 1, 1)
        }
        let closest = positions[0]
        for (let i in positions) {
            let position = positions[i]
            position.distToController = position.findPathTo(spawn).length
            if (position.distToController < closest.distToController) {
                closest = position
            }
        }
        return closest;
    },
    checkSquads: function (creep) {
        let squads = Memory.defense.squads
        let roomMem = Memory.rooms[creep.memory.home].squad
        if (roomMem && roomMem.isAssembling && !creep.memory.squadID) {
            squads[roomMem.squadID].members.push(creep.id)
            creep.memory.squadID = roomMem.squadID
        }
    }
};
