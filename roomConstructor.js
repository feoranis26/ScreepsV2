
let rfx = require("roomFunctions");
module.exports = {
    clearAreaNeeded: 8,
    processRoom: function (room) {
        
        if (room.controller.level < 1) {
            return
        }
        if (!Memory.rooms[room.name]) {
            this.constructNewRoom(room)
        }
        else if (Memory.rooms[room.name].automatic) {
            room.visual.circle(Memory.rooms[room.name].spawnPos, { fill: "black", radius: 1, opacity: 0.5 })
            this.updateExistingRoomConfig(room.name)
        }
        else if (Memory.rooms[room.name] != undefined && Memory.rooms[room.name].automatic == undefined) {
            Memory.rooms[room.name].automatic = false
        }
    },
    setupNewRoomMemory: function (roomName) {
        if (Memory.rooms && !Memory.rooms[roomName]) {
            if (Memory.defense) {
                Memory.defense[roomName] = { towersAttacking: {}, attackedCreeps: {} }
            }
            else {
                Memory.defense = {}
                Memory.defense[roomName] = { towersAttacking: {}, attackedCreeps: {} }
            }
            Memory.rooms[roomName] = {}
            Memory.rooms[roomName].energyReq = 300
            Memory.rooms[roomName].energySources = Game.rooms[roomName].find(FIND_SOURCES).length
            Memory.rooms[roomName].automatic = true
            Memory.rooms[roomName].constructorVersion = 2
        }
        else if (!Memory.rooms) {
            Memory.rooms = {}
        }
    },
    updateExistingRoomConfig: function (roomName) {
        if (!Memory.rooms[roomName].automatic|| Game.time % 50 != 0) {
            return;
        }
        if (!Memory.rooms[roomName].readyToRun) {
            if (Game.rooms[roomName].find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_SPAWN }).length > 0 && Memory.rooms[roomName].spawnPos) {
                Memory.rooms[roomName].readyToRun = true
            }
            else {
                if (Game.rooms[roomName].find(FIND_CONSTRUCTION_SITES, { filter: (s) => s.structureType == STRUCTURE_SPAWN }).length == 0) {
                    console.log("[RoomConstructor] No spawn found in room :" + roomName + ", creating new spawn.")
                    if (!Memory.rooms[roomName].spawnPos) {
                        this.findMostOpenSource(Game.rooms[roomName])
                        this.findSpawnPoint(Game.rooms[roomName])
                        return;
                    }
                    Game.rooms[roomName].createConstructionSite(Memory.rooms[roomName].spawnPos.x, Memory.rooms[roomName].spawnPos.y, STRUCTURE_SPAWN)
                    Game.rooms[roomName].readyToRun = false
                }
            }
        }
        if (!Memory.rooms[roomName].readyToRun) return;
        if (Game.rooms[roomName].controller.level >= 2) {
            if (!Memory.rooms[roomName].spawnContainer) { this.getSpawnContainer(roomName) }
            if (!Memory.rooms[roomName].wallsGenerated) { this.generateWalls(Game.rooms[roomName]) }
            if (!Memory.rooms[roomName].containersGenerated) { this.generateContainers(roomName) }
            this.generateExtensions(Game.rooms[roomName]);
        }
        if (Memory.rooms[roomName].wallsGenerated && Game.time % 10 == 0) {
            if (Memory.rooms[roomName].walls) {
                for (let i in Memory.rooms[roomName].wallPositions) {
                    let wallPos = Memory.rooms[roomName].wallPositions[i]
                    let x = wallPos.x, y = wallPos.y
                    let terrain = Game.rooms[roomName].lookAt(x, y)
                    //room.visual.rect(x - 0.5,y - 0.5, 1, 1)
                    for (let j = 0; j < terrain.length; j++) {
                        let terrainObj = terrain[j]
                        if (terrainObj.type == "structure") {
                            if (terrainObj.structure.structureType == STRUCTURE_RAMPART) {
                                Memory.rooms[roomName].walls[i] = terrainObj.structure.id
                            }
                        }
                    }
                }
            }
            for (let i in Memory.rooms[roomName].walls) {
                if (!Game.getObjectById(Memory.rooms[roomName].walls[i]) && Memory.rooms[roomName].walls[i]) {
                    Game.rooms[roomName].createConstructionSite(Memory.rooms[roomName].wallPositions[i].x, Memory.rooms[roomName].wallPositions[i].y, STRUCTURE_RAMPART)
                }
            }
        }
    },
    generateContainers: function (roomName) {
        let sources = Game.rooms[roomName].find(FIND_SOURCES)
        for (let i = 0; i < sources.length; i++) {
            let source = sources[i]
            let box = rfx.getBox(source, 1, Game.rooms[roomName])
            let free = 0;
            let pos = box[0]
            for (let i in box) {
                let boxPos = box[i]
                let boxFree = rfx.getFreeSpacesAround({ pos: boxPos, room: Game.rooms[roomName] }, 1, Game.rooms[roomName])
                if (boxFree > free) {
                    free = boxFree
                    pos = boxPos
                }
            }
            Game.rooms[roomName].createConstructionSite(pos, STRUCTURE_CONTAINER)
        }
        Memory.rooms[roomName].containersGenerated = true;
    },
    getSpawnContainer: function (roomName) {
        let spawnSource = Game.getObjectById(Memory.rooms[roomName].spawnSource)
        let containers = rfx.getStructureAround(spawnSource, STRUCTURE_CONTAINER, Game.rooms[roomName])
        if (containers.length > 0) {
            Memory.rooms[roomName].spawnContainer = containers[0].id
        }
    },
    constructNewRoom: function (room) {
        if (!Memory.rooms[room.name]) {
            this.setupNewRoomMemory(room.name)
        }
        if (!Memory.rooms[room.name].spawnPos) {
            this.findMostOpenSource(room)
            this.findSpawnPoint(room)
            return;
        }
        room.visual.circle(Memory.rooms[room.name].spawnPos, { fill: "black", radius: 1, opacity: 0.5 })
    },
    findMostOpenSource: function (room) {
        let sources = room.find(FIND_SOURCES)
        for (let i in sources) {
            let source = sources[i]
            source.free = rfx.getFreeSpacesAround(source, this.clearAreaNeeded)
        }
        let mostFree = sources[0]
        for (let i in sources) {
            let source = sources[i]
            if (source.free > mostFree.free) {
                mostFree = source
            }
        }
        room.visual.circle(mostFree.pos.x, mostFree.pos.y, { fill: "yellow", radius: 1 })
        Memory.rooms[room.name].spawnSource = mostFree.id
    },
    findSpawnPoint: function (room) {
        console.log("[RoomConstructor] Calculating spawn point for room :" + room.name)
        let clearAreaNeeded = this.clearAreaNeeded - 2
        let source = Game.getObjectById(Memory.rooms[room.name].spawnSource)
        let positions = []
        for (let x = source.pos.x - clearAreaNeeded; x < source.pos.x + clearAreaNeeded + 1; x++) {
            let y = source.pos.y - clearAreaNeeded
            room.visual.rect(x - 0.5, y - 0.5, 1, 1, { fill: "red", opacity: 0.25 })
            let terrain = room.getTerrain().get(x, y)
            if (terrain == 0 && x < 45 && x > 5 && y < 45 && y > 5)
                positions.push(new RoomPosition(x, y, room.name))
        }
        for (let y = source.pos.y - clearAreaNeeded + 1; y < source.pos.y + clearAreaNeeded - 1; y++) {
            let x = source.pos.x - clearAreaNeeded
            room.visual.rect(x - 0.5, y - 0.5, 1, 1, { fill: "red", opacity: 0.25 })
            let terrain = room.getTerrain().get(x, y)
            if (terrain == 0 && x < 45 && x > 5 && y < 45 && y > 5)
                positions.push(new RoomPosition(x, y, room.name))
        }
        for (let y = source.pos.y - clearAreaNeeded + 1; y < source.pos.y + clearAreaNeeded; y++) {
            let x = source.pos.x + clearAreaNeeded
            room.visual.rect(x - 0.5, y - 0.5, 1, 1, { fill: "red", opacity: 0.25 })
            let terrain = room.getTerrain().get(x, y)
            if (terrain == 0 && x < 45 && x > 5 && y < 45 && y > 5)
                positions.push(new RoomPosition(x, y, room.name))
        }
        for (let x = source.pos.x - clearAreaNeeded; x < source.pos.x + clearAreaNeeded + 1; x++) {
            let y = source.pos.y + clearAreaNeeded
            room.visual.rect(x - 0.5, y - 0.5, 1, 1, { fill: "red", opacity: 0.25 })
            let terrain = room.getTerrain().get(x, y)
            if (terrain == 0 && x < 45 && x > 5 && y < 45 && y > 5)
                positions.push(new RoomPosition(x, y, room.name))
        }

        console.log(positions.length)
        let candidates = []
        let srcBox = rfx.getBox(source, 1, room)[0]
        for (let i in positions) {
            let position = positions[i]

            let pathResult = PathFinder.search(position, srcBox, {
                roomCallback: function (roomName) {
                    let room = Game.rooms[roomName];
                    if (!room) return;
                    let costs = new PathFinder.CostMatrix;

                    room.find(FIND_STRUCTURES).forEach(function (struct) {
                        if (struct.structureType === STRUCTURE_WALL) {
                            costs.set(struct.pos.x, struct.pos.y, 255);
                        }
                    });

                    return costs;
                }
            })
            if (pathResult.incomplete) {
                room.visual.poly(pathResult.path, { stroke: "red", lineStyle: 'dotted', opacity: 1 })
                room.visual.rect(position.x - 0.5, position.y - 0.5, 1, 1, { fill: "red", opacity: 1 })
                continue
            }
            let distToSource = pathResult.path.length
            room.visual.poly(pathResult.path, { stroke: "green", lineStyle: 'dotted', opacity: 1 })
            room.visual.rect(position.x - 0.5, position.y - 0.5, 1, 1, { fill: "#f5b042", opacity: 1 })
            if (distToSource - clearAreaNeeded > 1) {
                continue
            }
            position.distToController = position.findPathTo(room.controller).length
            room.visual.poly(pathResult.path, { stroke: "white", lineStyle: 'dotted', opacity: 1 })
            room.visual.rect(position.x - 0.5, position.y - 0.5, 1, 1, { fill: "aqua", opacity: 1 })
            candidates.push(position)
        }
        let closest = candidates[0]
        for (let i in candidates) {
            let candidate = candidates[i]
            if (candidate.distToController < closest.distToController) {
                closest = candidate
            }
        }
        let closeCandidates = []
        for (let i in candidates) {
            let candidate = candidates[i]
            if (candidate.distToController == closest.distToController) {
                closeCandidates.push(candidate)
            }
        }
        let mostOpenCandidate = { pos: closeCandidates[0], room: room }
        for (let i in closeCandidates) {
            let candidate = { pos: closeCandidates[i], room: room }
            if (rfx.getFreeSpacesAround(candidate, 4) < rfx.getFreeSpacesAround(mostOpenCandidate, 4)) {
                mostOpenCandidate = candidate
            }
        }
        room.visual.circle(mostOpenCandidate.pos, { fill: "black", radius: 1, opacity: 1 })
        Memory.rooms[room.name].spawnPos = mostOpenCandidate.pos
        room.createConstructionSite(mostOpenCandidate.pos, STRUCTURE_SPAWN)
    },
    generateWalls: function (room) {
        let clearAreaNeeded = this.clearAreaNeeded
        let source = Memory.rooms[room.name].spawnPos
        let positions = rfx.getBox({ pos: source, room: room }, clearAreaNeeded, room)
        let wOrR = 0
        for (let i in positions) {
            wOrR++
            let pos = positions[i]
            if (wOrR < 5) {
                room.visual.rect(pos.x - 0.5, pos.y - 0.5, 1, 1)
                room.createConstructionSite(pos, STRUCTURE_WALL)
            }
            else {
                room.visual.rect(pos.x - 0.5, pos.y - 0.5, 1, 1, { fill: "green" })
                room.createConstructionSite(pos, STRUCTURE_RAMPART)
                wOrR = 0;
            }
        }
        Memory.rooms[room.name].wallPositions = positions
        Memory.rooms[room.name].wallsGenerated = true
    }, generateExtensions: function (room) {
        if (!Memory.rooms[room.name].automatic || Game.time % 100 != 0) {
            return;
        }
        let placedExtensions = room.find(FIND_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_EXTENSION }).length
        let construcredExtensions = room.find(FIND_CONSTRUCTION_SITES, { filter: (s) => s.structureType == STRUCTURE_EXTENSION }).length
        let totalExtensions = this.getExtensionCountForRoom(room)
        let extensionsToPlace = (totalExtensions - placedExtensions) - construcredExtensions;
        if (extensionsToPlace == 0) { return; }
        let extensionCount = 0;
        let spawnSource = Game.getObjectById(Memory.rooms[room.name].spawnSource).pos
        let source = { pos: Memory.rooms[room.name].spawnPos }
        switch (Memory.rooms[room.name].constructorVersion) {
            default:
            case 2:
                for (let i = 5; i < 9; i++) {
                    let spiral = rfx.getBoxNonEmpty(source, i, room)
                    for (let j in spiral) {
                        let pos = spiral[j]
                        let x = pos.x
                        let y = pos.y
                        if (rfx.isPosEmpty(x, y, room)) {
                            let distx = x - spawnSource.x
                            let disty = y - spawnSource.y
                            if (Math.sqrt(Math.abs(distx * distx + disty * disty)) < 5) {
                                continue
                            }
                            distx = x - room.controller.pos.x
                            disty = y - room.controller.pos.x
                            if (Math.sqrt(Math.abs(distx * distx + disty * disty)) < 5) {
                                continue
                            }
                            if (extensionCount > extensionsToPlace) { break; }
                            if (j % 2 != 0) {
                                room.visual.rect(x - 0.5, y - 0.5, 1, 1, { fill: "yellow" })
                                room.createConstructionSite(x, y, STRUCTURE_EXTENSION)
                                extensionCount++;
                            }
                            else {
                                room.visual.rect(x - 0.5, y - 0.5, 1, 1, { fill: "blue" })
                                room.createConstructionSite(x, y, STRUCTURE_ROAD)
                            }
                        }
                        if (extensionCount > extensionsToPlace) { break; }
                    }
                    if (extensionCount > extensionsToPlace) { break; }
                }
                break;
        }

    }, getExtensionCountForRoom: function (room) {
        let lvl = room.controller.level
        switch (lvl) {
            case 1:
                return 0
            case 2:
                return 5
            case 3:
                return 10
            case 4:
                return 20
            case 5:
                return 30
            case 6:
                return 40
            case 7:
                return 50
            case 8:
                return 60

        }
    }/*,
    checkIntegrity: function (room) {
        let exits = []
        exits.push(room.find(FIND_EXITS_LEFT)[0])
        exits.push(room.find(FIND_EXITS_RIGHT)[0])
        exits.push(room.find(FIND_EXITS_TOP)[0])
        exits.push(room.find(FIND_EXITS_BOTTOM)[0])
        let level1 = rfx.getBox({pos:new RoomPosition(24,24)}, 10, room)[0]
        for (let exitNum in exits) {
            let exit = exits[exitNum]
            let path = PathFinder.search()<
        }
    }*/
};/*
let y = Memory.rooms[room.name].spawnPos.y + j;
            if (y % 2 == 0) {
                xstart = -6
            }
            else {
                xstart = -7
            }
            for (let i = xstart; i < 8; i += 2) {
                let x = Memory.rooms[room.name].spawnPos.x + i;
                if (rfx.isPosEmpty(x, y, room)) {
                    extensionCount++;
                    if (extensionCount > extensionsToPlace) { break; }
                    room.visual.rect(x - 0.5, y - 0.5, 1, 1, { fill: "green" })
                }

            }
            for (let i = xstart - 1; i < 8; i += 2) {
                if (i < -7) { continue }
                let x = Memory.rooms[room.name].spawnPos.x + i;
                if (rfx.isPosEmpty(x, y, room)) {
                    if (extensionCount > extensionsToPlace) { break; }
                    room.visual.rect(x - 0.5, y - 0.5, 1, 1, { fill: "red" })
                }

            }*/