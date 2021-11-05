module.exports = {
    name: "destroyer",
    suffix: "DS",
    amount: 1
    ,
    spawn: function (room, spawn) {
        return true
    },
    run: function (creep) {
        let structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter:(s)=>s.room.name == creep.room.name})
        console.log(structure)
        creep.moveTo(structure)
        creep.dismantle(structure)
    }
};