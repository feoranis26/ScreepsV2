let manufacturing = require("manufacturing")
module.exports = {
    name: "manufacturer",
    suffix: "MF",
    amount: 1
    ,
    spawn: function (room, spawn, num) {
        //let num = _.sum(Game.creeps, (c) => c.memory.role == this.name && c.room.name == room.name && !c.memory.deactivated);
        let numSources = this.amount * (Memory.rooms[room.name].recipe != undefined);
        if (num < numSources && room.energyAvailable >= Memory.rooms[room.name].energyReq || (Memory.rooms[room.name].critical && num < 3)) {
            if (spawn.spawnCreep(require("spawning").getSpawnCreepBody(room.energyAvailable), require("spawning").getName(room, this.suffix), { memory: { role: this.name, target: room.name } }) == 0) {
                return false
            }
        }
        if (num < numSources) {
            return false
        }
        return true
    }, hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) },
    run: function (creep) {
        if (!Memory.rooms[creep.room.name].recipe) {
            return
        }
        switch (creep.memory.state) {
            default:
                this.getIngredients(creep);
                break;
            case "react":
                this.react(creep);
                break;
            case "sell":
                this.sell(creep);
                break;
        }
    },
    getIngredients: function (creep) {
        let factory = creep.room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_FACTORY })[0];
        let recipe = Memory.rooms[creep.room.name].recipe
        if (creep.memory.ingredient != undefined) {
            if (factory.store[creep.memory.ingredient.res] >= creep.memory.ingredient.amount) {
                creep.memory.ingredient = null;
            }
            else {
                if (!creep.memory.depositing) {
                    let withdrawAmount = creep.carryCapacity;
                    let str = Game.getObjectById(recipe.str[creep.memory.ingredient.res]);
                    if (creep.carryCapacity > creep.memory.ingredient.amount - factory.store[creep.memory.ingredient.res]) {
                        withdrawAmount = creep.memory.ingredient.amount - factory.store[creep.memory.ingredient.res]
                    }
                    let withdraw = creep.withdraw(str, creep.memory.ingredient.res, withdrawAmount)
                    if (withdraw == 0) {
                        creep.memory.depositing = true;
                        return;
                    } else if (withdraw == ERR_NOT_IN_RANGE) {
                        creep.moveTo(str);
                    }
                    else {
                        if (!manufacturing.checkRecipe(creep.room.name)) {
                            Memory.rooms[creep.room.name].recipe = undefined
                        }
                        creep.memory.ingredient = undefined;
                    }
                }
                else {
                    let trans = creep.transfer(factory, creep.memory.ingredient.res)
                    if (trans == ERR_NOT_IN_RANGE) {
                        creep.moveTo(factory);
                    }
                    else if (trans == 0) {
                        if (creep.memory.ingredient.amount - factory.store[creep.memory.ingredient.res] > 0 && creep.ticksToLive > 50) {
                            creep.memory.depositing = false;
                        }
                        else if (creep.ticksToLive > 50) {
                            creep.memory.ingredient = undefined;
                        }
                    }
                }
            }
        }
        else {
            this.findIngredient(creep);
        }
    },
    react: function (creep) {
        creep.memory.ingredient = undefined;
        let factory = creep.room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_FACTORY })[0];
        let recipe = Memory.rooms[creep.room.name].recipe
        if (factory.produce(recipe.out) == 0) {
            creep.memory.state = "sell";
        }
    },
    sell: function (creep) {
        let factory = creep.room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_FACTORY })[0];
        let recipe = Memory.rooms[creep.room.name].recipe
        if (!creep.memory.takeout) {
            let out = creep.withdraw(factory, recipe.out);
            if (out == ERR_NOT_IN_RANGE) {
                creep.moveTo(factory);
            }
            else if (out == 0) {
                creep.memory.takeout = true
            }
        }
        else {
            let term = creep.room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_TERMINAL })[0];
            let trans = creep.transfer(term, recipe.out);
            if (trans == ERR_NOT_IN_RANGE) {
                creep.moveTo(term);
            }
            else if (trans == 0) {
                creep.memory.takeout = false
                if (!manufacturing.checkRecipe(creep.room.name)) {
                    console.log("[Creep] <" + creep.name + ">("+ this.name + "): Room " + creep.room.name + " finished recipe to make " + recipe.out + ".")
                    Memory.rooms[creep.room.name].recipe = undefined
                }
                else if(factory.store[recipe.out] == 0)
                    creep.memory.state = undefined
            }
        }
    },
    findIngredient: function (creep) {
        let factory = creep.room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_FACTORY })[0];
        let recipe = Memory.rooms[creep.room.name].recipe
        for (let i in recipe.in) {
            ingredient = recipe.in[i];
            if (factory.store[ingredient.res] < ingredient.amount) {
                creep.memory.ingredient = ingredient
                return
            }
        }
        creep.memory.state = "react"
    }
};