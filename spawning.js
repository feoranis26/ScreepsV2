module.exports = {
    name: "spawning"
    ,
    getSpawnCreepBody: function (energy, maxEnergy) {
        if (!maxEnergy) {
            maxEnergy = 800
        }
        if (energy > maxEnergy) {
            energy = maxEnergy
        }
        let numparts = Math.floor(energy / 200)
        let body = [];
        for (let i = 0; i < numparts; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < numparts; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numparts; i++) {
            body.push(MOVE);
        }
        return body;
    },
    getHarvesterBody: function (energy) {
        if (energy > 1200) {
            energy = 1200
        }
        if (energy >= 200) {
            let numparts = Math.floor(energy / 100)
            let body = [];
            body.push(CARRY);
            body.push(MOVE);
            for (let i = 0; i < numparts - 1; i++) {
                body.push(WORK);
            }
            return body;
        }
    },
    getCarrierBody: function (energy) {
        if (energy > 1600) {
            energy = 1600
        }
        if (energy >= 200) {
            let numparts = Math.floor(energy / 150)
            let body = [];
            for (let i = 0; i < numparts; i++) {
                body.push(CARRY);
                body.push(CARRY);
                body.push(MOVE);
            }
            return body;
        }
    },
    getAttackBody: function (room) {
        let body = []
        let numparts = Math.floor(room.energyAvailable / 150)
        if (!Memory.rooms[room.name].critical) {
            if (numparts >= 3) {
                numparts = 2
            }
        }
        if (numparts > 12) {
            numparts = 12
        }
        for (let i = 0; i < numparts - 1; i++) {
            body.push(TOUGH)
            body.push(TOUGH)
        }
        for (let i = 0; i < numparts - 1; i++) {
            body.push(MOVE)
        }
        for (let i = 0; i < numparts - 1; i++) {
            body.push(ATTACK)
        }
        return body
    },
    getPowerBody: function (room) {
        let body = []
        let numparts = Math.floor(room.energyAvailable / 780)
        if (numparts >= 3) {
            numparts = 2
        }
        for (let i = 0; i < numparts - 1; i++) {
            body.push(ATTACK)
        }
        for (let i = 0; i < numparts - 1; i++) {
            body.push(ATTACK)
        }
        for (let i = 0; i < numparts - 1; i++) {
            body.push(CARRY)
        }
        for (let i = 0; i < numparts - 1; i++) {
            body.push(CARRY)
        }
        for (let i = 0; i < numparts - 1; i++) {
            body.push(CARRY)
        }
        for (let i = 0; i < numparts - 1; i++) {
            body.push(CARRY)
        }
        for (let i = 0; i < numparts - 1; i++) {
            body.push(HEAL)
        }
        for (let i = 0; i < numparts - 1; i++) {
            body.push(MOVE)
        }
        for (let i = 0; i < numparts - 1; i++) {
            body.push(MOVE)
        }
        for (let i = 0; i < numparts - 1; i++) {
            body.push(MOVE)
        }
        for (let i = 0; i < numparts - 1; i++) {
            body.push(MOVE)
        }
        return body
    },
    getLongHarvesterBody: function (energy, maxEnergy) {
        if (!maxEnergy) {
            maxEnergy = 2400
        }
        if (energy > maxEnergy) {
            energy = maxEnergy
        }
        let numparts = Math.floor(energy / 550)
        let body = [];
        for (let i = 0; i < numparts * 2; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < numparts * 3; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numparts * 3; i++) {
            body.push(MOVE);
        }
        return body;
    },
    getName: function (room, name) {
        return room.name + "_" + this.hash((Math.random().toString()))
    },
    hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) }
};