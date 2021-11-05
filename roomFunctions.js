module.exports = {
    getFreeSpacesAround: function (obj, rad) {
        let open = 0; 3
        for (let x = obj.pos.x - rad; x < obj.pos.x + rad + 1; x++) {
            for (let y = obj.pos.y - rad; y < obj.pos.y + rad + 1; y++) {
                let terrain = obj.room.getTerrain().get(x, y)
                if (terrain == 0) {
                    open++
                    obj.room.visual.rect(x - 0.5, y - 0.5, 1, 1, { fill: 'green', opacity: 0.1 })
                }
                else {
                    obj.room.visual.rect(x - 0.5, y - 0.5, 1, 1, { fill: 'red', opacity: 0.1 })
                }
            }
        }
        return open
    },
    getBox: function (source, radius, room) {
        let clearAreaNeeded = radius
        let positions = []
        for (let x = source.pos.x - clearAreaNeeded; x < source.pos.x + clearAreaNeeded + 1; x++) {
            let y = source.pos.y - clearAreaNeeded
            if (x < 0 || x > 49 || y < 0 || y > 49) { continue }
            let terrain = room.lookAt(x, y)
            if (x < 50 && x > 0 && y < 50 && y > 0) {
                for (let i = 0; i < terrain.length; i++) {
                    let terrainObj = terrain[i]
                    if (terrainObj.type == "terrain") {
                        if (terrainObj.terrain == "plain" || terrainObj.terrain == "swamp") {
                            positions.push(new RoomPosition(x, y, room.name))
                        }
                    }
                }
            }
        }
        for (let y = source.pos.y - clearAreaNeeded + 1; y < source.pos.y + clearAreaNeeded; y++) {
            let x = source.pos.x - clearAreaNeeded
            if (x < 0 || x > 49 || y < 0 || y > 49) { continue }
            let terrain = room.lookAt(x, y)
            if (x < 50 && x > 0 && y < 50 && y > 0) {
                for (let i = 0; i < terrain.length; i++) {
                    let terrainObj = terrain[i]
                    if (terrainObj.type == "terrain") {
                        if (terrainObj.terrain == "plain" || terrainObj.terrain == "swamp") {
                            positions.push(new RoomPosition(x, y, room.name))
                        }
                    }
                }
            }
        }
        for (let y = source.pos.y - clearAreaNeeded + 1; y < source.pos.y + clearAreaNeeded; y++) {
            let x = source.pos.x + clearAreaNeeded
            if (x < 0 || x > 49 || y < 0 || y > 49) { continue }
            let terrain = room.lookAt(x, y)
            if (x < 50 && x > 0 && y < 50 && y > 0) {
                for (let i = 0; i < terrain.length; i++) {
                    let terrainObj = terrain[i]
                    if (terrainObj.type == "terrain") {
                        if (terrainObj.terrain == "plain" || terrainObj.terrain == "swamp") {
                            positions.push(new RoomPosition(x, y, room.name))
                        }
                    }
                }
            }
        }
        for (let x = source.pos.x - clearAreaNeeded; x < source.pos.x + clearAreaNeeded + 1; x++) {
            let y = source.pos.y + clearAreaNeeded
            if (x < 0 || x > 49 || y < 0 || y > 49) { continue }
            let terrain = room.lookAt(x, y)
            for (let i = 0; i < terrain.length; i++) {
                let terrainObj = terrain[i]
                if (terrainObj.type == "terrain") {
                    if (terrainObj.terrain == "plain" || terrainObj.terrain == "swamp") {
                        room.visual.rect(x - 0.5, y - 0.5, 1, 1)
                        positions.push(new RoomPosition(x, y, room.name))
                    }
                }
            }
        }
        for (let i in positions) {
            let pos = positions[i]
            room.visual.rect(pos.x - 0.5, pos.y - 0.5, 1, 1)
        }

        return positions;
    },
    getBoxEven: function (source, radius, room) {
        let clearAreaNeeded = radius
        let positions = []
        for (let x = source.pos.x - clearAreaNeeded; x < source.pos.x + clearAreaNeeded; x++) {
            let y = source.pos.y - clearAreaNeeded
            room.visual.rect(x - 0.5, y - 0.5, 1, 1)
            let terrain = room.lookAt(x, y)
            if (x < 50 && x > 0 && y < 50 && y > 0) {
                for (let i = 0; i < terrain.length; i++) {
                    let terrainObj = terrain[i]
                    if (terrainObj.type == "terrain") {
                        if (terrainObj.terrain == "plain" || terrainObj.terrain == "swamp") {
                            positions.push(new RoomPosition(x, y, room.name))
                        }
                    }
                }
            }
        }
        for (let y = source.pos.y - clearAreaNeeded + 1; y < source.pos.y + clearAreaNeeded; y++) {
            let x = source.pos.x - clearAreaNeeded
            room.visual.rect(x - 0.5, y - 0.5, 1, 1)
            let terrain = room.lookAt(x, y)
            if (x < 50 && x > 0 && y < 50 && y > 0) {
                for (let i = 0; i < terrain.length; i++) {
                    let terrainObj = terrain[i]
                    if (terrainObj.type == "terrain") {
                        if (terrainObj.terrain == "plain" || terrainObj.terrain == "swamp") {
                            positions.push(new RoomPosition(x, y, room.name))
                        }
                    }
                }
            }
        }
        clearAreaNeeded = radius - 1
        for (let y = source.pos.y - clearAreaNeeded; y < source.pos.y + clearAreaNeeded; y++) {
            let x = source.pos.x + clearAreaNeeded
            room.visual.rect(x - 0.5, y - 0.5, 1, 1)
            let terrain = room.lookAt(x, y)
            if (x < 50 && x > 0 && y < 50 && y > 0) {
                for (let i = 0; i < terrain.length; i++) {
                    let terrainObj = terrain[i]
                    if (terrainObj.type == "terrain") {
                        if (terrainObj.terrain == "plain" || terrainObj.terrain == "swamp") {
                            positions.push(new RoomPosition(x, y, room.name))
                        }
                    }
                }
            }
        }
        for (let x = source.pos.x - clearAreaNeeded; x < source.pos.x + clearAreaNeeded + 1; x++) {
            let y = source.pos.y + clearAreaNeeded
            room.visual.rect(x - 0.5, y - 0.5, 1, 1)
            let terrain = room.lookAt(x, y)
            if (x < 50 && x > 0 && y < 50 && y > 0) {
                for (let i = 0; i < terrain.length; i++) {
                    let terrainObj = terrain[i]
                    if (terrainObj.type == "terrain") {
                        if (terrainObj.terrain == "plain" || terrainObj.terrain == "swamp") {
                            positions.push(new RoomPosition(x, y, room.name))
                        }
                    }
                }
            }
        }
        for (let i in positions) {
            let pos = positions[i]
            room.visual.rect(pos.x - 0.5, pos.y - 0.5, 1, 1)
        }
        return positions;
    },
    getStructureAround: function (src, str, room) {
        let box = this.getBox(src, 1, room)
        let structures = []
        for (let i = 0; i < box.length; i++) {
            let boxPos = box[i]
            let look = room.lookAt(boxPos)
            for (let j = 0; j < look.length; j++) {
                let lookObj = look[j]
                if (lookObj.type != "structure") {
                    continue;
                }
                if (lookObj.structure.structureType == str) {
                    structures.push(lookObj.structure)
                }
            }
        }
        return structures
    },
    isPosEmpty: function (x, y, room) {
        if (x < 50 && x > 0 && y < 50 && y > 0) {
            let terrain = room.lookAt(x, y)
            for (let i = 0; i < terrain.length; i++) {
                let terrainObj = terrain[i]
                if (terrainObj.type == "terrain") {
                    if (terrainObj.terrain == "wall") {
                        return false
                    }
                }
                if (terrainObj.type == "structure") {
                    if (terrainObj.structure != undefined) {
                        return false
                    }
                }
            }
            return true
        }
        return false
    },
    getBoxNonEmpty: function (source, radius, room) {
        let clearAreaNeeded = radius
        let positions = []
        for (let x = source.pos.x - clearAreaNeeded; x < source.pos.x + clearAreaNeeded + 1; x++) {
            let y = source.pos.y - clearAreaNeeded
            if (x < 0 || x > 49 || y < 0 || y > 49) { continue }
            positions.push(new RoomPosition(x, y, room.name))
        }
        for (let y = source.pos.y - clearAreaNeeded + 1; y < source.pos.y + clearAreaNeeded; y++) {
            let x = source.pos.x + clearAreaNeeded
            if (x < 0 || x > 49 || y < 0 || y > 49) { continue }
            positions.push(new RoomPosition(x, y, room.name))
        }
        for (let x = source.pos.x + clearAreaNeeded; x > source.pos.x - clearAreaNeeded-1; x--) {
            let y = source.pos.y + clearAreaNeeded
            if (x < 0 || x > 49 || y < 0 || y > 49) { continue }
            positions.push(new RoomPosition(x, y, room.name))
        }
        for (let y = source.pos.y + clearAreaNeeded - 1; y > source.pos.y - clearAreaNeeded - 1; y--) {
            let x = source.pos.x - clearAreaNeeded
            if (x < 0 || x > 49 || y < 0 || y > 49) { continue }
            positions.push(new RoomPosition(x, y, room.name))
        }
        return positions;
    }
};