module.exports = {
    visualizeOwn: function (room) {
        let visualizer = Game.map.visual
        this.visualizeEnergyStatus(visualizer, room)
        this.visualizeRecipe(room)
    },
    visualizeEnergyStatus: function (vis, room) {
        let progress = room.energyAvailable / room.energyCapacityAvailable
        let pos = new RoomPosition(16, 49, room.name)
        let n = room.name
        vis.rect(pos, 18, 6, { fill: "#04ff00" });
        vis.rect(pos, (1 - (progress / 1)) * 18, 6, { fill: "#ff3700", opacity: 0.5 })
        if (progress < 0.15) {
            vis.poly([
                rp(25, 5, n),
                rp(44, 44, n),
                rp(6, 44, n)],
                { fill: "#f0d807", opacity: 0.75, strokeWidth: 0 })
            vis.line(rp(25, 15, n), rp(25, 30, n), { color: "#000000", width: 5, opacity: 0.5 })
            vis.line(rp(25, 35, n), rp(25, 40, n), { color: "#000000", width: 5, opacity: 0.5 })
            vis.text("ENERGY LOW!", rp(25, 45, n), {fontSize:7})
        }
    },
    visualizeRecipe: function (room) {
        if (!Memory.rooms[room.name].recipe) return;
        let recipe=Memory.rooms[room.name].recipe
        let vis = Game.map.visual;
        let pos = new RoomPosition(25, 25, room.name)
        vis.circle(pos, { fill: "gray", opacity: 1 , radius: 15});
        pos = new RoomPosition(25, 20, room.name)
        vis.text("🏭", pos, { font: 8 });
        pos = new RoomPosition(25, 30, room.name)
        vis.text(Memory.rooms[room.name].recipe.out, pos, { font: 6 });
    }
};
function rp(x, y, room) {
    return new RoomPosition(x, y, room)
}