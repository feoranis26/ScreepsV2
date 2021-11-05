module.exports = {
    addRecipe: function (ingredients, buyLinks, result) {
        Memory.actions.reacting[result].in = ingredients;
        Memory.actions.reacting[result].buy = buyLinks;
    },
    getRecipeByResult: function (recipe) {
        if (Memory.actions.reacting[recipe]) {
            let recipeObj = {}
            recipeObj.in = Memory.actions.reacting[recipe].in
            recipeObj.buy = Memory.actions.reacting[recipe].buy
            recipeObj.out = recipe
            return recipeObj
        }
    },
    findRecipe: function (room) {
        let recipes = Memory.actions.reacting;
        for (let i in recipes) {
            let ingredient404 = false;
            let recipe = recipes[i];
            let structures = {};
            for (let ing in recipe.in) {
                inp = recipe.in[ing]
                let str = Game.rooms[room].find(FIND_MY_STRUCTURES, {
                    filter: (s) => {
                        if (s.store) {
                            if (s.store[inp.res] >= inp.amount) {
                                return true;
                            }
                        }
                    }
                });
                if (str.length == 0) {
                    ingredient404 = true;
                    break;
                }
                else {
                    structures[inp.res] = str[0].id;
                }
            }
            if (ingredient404) {
                continue;
            }
            recipe.str = structures;
            return recipe;
        }
        return null;
    },
    checkRecipe: function (room) {
        let ingredient404 = false;
        let recipe = Memory.rooms[room].recipe;
        for (let ing in recipe.in) {
            inp = recipe.in[ing]
            let str = Game.rooms[room].find(FIND_MY_STRUCTURES, {
                filter: (s) => {
                    if (s.store) {
                        if (s.store[inp.res] >= inp.amount) {
                            return true;
                        }
                    }
                }
            });
            if (str.length == 0) {
                ingredient404 = true;
                break;
            }
        }
        return !ingredient404;
    },
    tick: function (room) {
        if(Game.time % 10 != 0) {
            return
        }
        room = Game.rooms[room]
        let fact = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_FACTORY })[0];
        let term = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_TERMINAL })[0];
        this.visualize(room, fact, term)
        if (!fact || Game.time % 50 != 0) {
            return
        }
        let stor = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_STORAGE })[0];
        if (stor && term && fact) {
            if (!Memory.rooms[room.name].recipe) {
                Memory.rooms[room.name].recipe = this.findRecipe(room.name);
                if (Memory.rooms[room.name].recipe) {
                    console.log("Giving room " + room.name + " recipe to make " + Memory.rooms[room.name].recipe.out + ".")
                }
            }
        }
    }, 
    visualize: function (room, fact, term) {
        if (!Memory.rooms[room.name].recipe) return;
        let recipe=Memory.rooms[room.name].recipe
        let vis = room.visual;
        let pos = fact.pos
        vis.line(pos.x, pos.y, pos.x - 1.5, pos.y, { fill: "red", opacity: 0.25 })
        vis.circle(pos, {radius:1, fill:"lime", opacity:0.25})
        vis.text("🏭 Manufacturing 🏭:", pos.x - 2.5, pos.y - 0.125, { font: 0.25 });
        vis.text(Memory.rooms[room.name].recipe.out, pos.x - 2.5, pos.y + 0.25, { font: 0.25 });
        vis.rect(pos.x - 3.75, pos.y - 0.625, 2.5, 1.25, { fill: "gray", opacity: 0.25 });
        pos.y += 1
        for (let i in recipe.in) {
            let ing = recipe.in[i]
            pos.y += 1
            vis.rect(pos.x - 3.5, pos.y-0.5, 2, 1, { fill: "gray", opacity: 0.25 });
            vis.text(ing.res, pos.x - 2.5, pos.y, { font: 0.25 });
            this.progressBar(pos.x - 3, pos.y +0.125, room, fact.store[ing.res] / ing.amount)
        }
        pos.y += 1
        vis.rect(pos.x - 3.5, pos.y-0.5, 2, 1, { fill: "gray", opacity: 0.25 });
        vis.text("Count: " + term.store[recipe.out], pos.x - 2.5, pos.y, { font: 0.25 });
    },
    progressBar: function(x, y, room, progress) {
        let vis = room.visual;
        vis.rect(x, y, 1, 0.25, { fill: "green" });
        vis.rect(x, y, (1 - (progress / 1)) * 1, 0.25, { fill: "red", opacity: 1 })
    }

};