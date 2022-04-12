module.exports = {
    name: "towerManager"
    ,
    run: function (roomdat) {
        let room = Game.rooms[roomdat];
        let hostile_creeps = room.find(FIND_HOSTILE_CREEPS)
        if(hostile_creeps.length == 0 && Game.time % 25 != 0 && !Memory.defense[room.name].repairedWall){return}
        let towers = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_TOWER })
        for (let towername in towers) {
            let tower = towers[towername]
            if (!Memory.rooms[tower.room.name].disableTowerRepairs && Memory.defense[tower.room.name].repairedWall && Game.getObjectById(Memory.defense[tower.room.name].repairedWall) && Game.getObjectById(Memory.defense[tower.room.name].repairedWall).hits < 100000) {
                tower.repair(Game.getObjectById(Memory.defense[tower.room.name].repairedWall))
                continue
            }
            else if (Memory.defense[tower.room.name].repairedWall && !Game.getObjectById(Memory.defense[tower.room.name].repairedWall) || (Game.getObjectById(Memory.defense[tower.room.name].repairedWall) && Game.getObjectById(Memory.defense[tower.room.name].repairedWall).hits >= 100000)){
                delete Memory.defense[tower.room.name].repairedWall
            }
            else if (!Memory.defense[tower.room.name].repairedWall) {
                //if (Game.time % 25 == 0) {
                    let target = room.find(FIND_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART});
                    target = _.min(target, function(s){return s.hits})
                    if (target) {
                        Memory.defense[tower.room.name].repairedWall = target.id;
                    }
                //}
            }
            
            for (let id in Memory.defense[tower.room.name].attackedCreeps) {
                if (!Game.getObjectById(id)) {
                    Memory.defense[tower.room.name].towersAttacking[Memory.defense[tower.room.name].attackedCreeps[id]] = undefined;
                    delete Memory.defense[tower.room.name].attackedCreeps[id]
                }
            }
            //if (Memory.defense[tower.room.name].towersAttacking[tower.id] == undefined) {
            for (let hostile_creep in hostile_creeps) {
                //if (Memory.defense[roomdat].attackedCreeps[hostile_creeps[hostile_creep].id] == undefined || Memory.defense[tower.room.name].attackedCreeps[hostile_creeps[hostile_creep].id] == tower.id) {

                /*let body = hostile_creeps[hostile_creep].body;
                let hasAttackPart = false;
                for (let partName in body) {
                    if (body[partName].type == ATTACK || body[partName].type == RANGED_ATTACK) {
                        hasAttackPart = true;
                    }
                }
                if (hasAttackPart) {*/
                    Memory.defense[tower.room.name].attackedCreeps[hostile_creeps[hostile_creep].id] = tower.id
                    Memory.defense[tower.room.name].towersAttacking[tower.id] = hostile_creeps[hostile_creep].id;
                    break;
                //}

                //}
            }
            //}
            //if (Memory.defense[tower.room.name].towersAttacking[tower.id] == undefined) {
            for (let hostile_creep in hostile_creeps) {
                //if (Memory.defense[tower.room.name].attackedCreeps[hostile_creeps[hostile_creep].id] == undefined || Memory.defense[tower.room.name].attackedCreeps[hostile_creeps[hostile_creep].id] == tower.id && Memory.defense[tower.room.name].towersAttacking[tower.id] == false) {

                let body = hostile_creeps[hostile_creep].body;
                let hasHealPart = false;
                for (let partName in body) {
                    if (body[partName].type == HEAL) {
                        hasHealPart = true;
                    }
                }
                if (hasHealPart) {
                    Memory.defense[tower.room.name].attackedCreeps[hostile_creeps[hostile_creep].id] = tower.id
                    Memory.defense[tower.room.name].towersAttacking[tower.id] = hostile_creeps[hostile_creep].id;
                    break;
                }
                //}
            }
            //}
            //else {
            tower.attack(Game.getObjectById(Memory.defense[tower.room.name].towersAttacking[tower.id]))
            //}
            // creep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {filter : (c)=>c.hits < c.hitsMax})
            //tower.heal(creep)
        }
    }
};