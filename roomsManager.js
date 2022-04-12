let creepManager = require("creepsManager");
let creepActions = require("creepActions");
let towermgr = require("towerManager")
let roomConstruct = require("roomConstructor")
let roomVisualizer = require("visualizer")
let manufacturing = require("manufacturing");
let strManager = require("strManager");
let sqdManager = require("squadManager");

module.exports = {
    tick: function () {
        for (let n in Game.rooms) {

            if (!this.isOwn(n))
                continue

            roomConstruct.processRoom(Game.rooms[n])

            if (Memory.rooms[n] == undefined) {
                continue;
            }
            if (!Memory.rooms[n].readyToRun) {
                continue;
            }

            this.processOwn(n)
        }
        this.updateClaimRoom()

    },
    processOwn: function (n) {
        if (Game.time % 5 == 0)
            this.updateCritical(n);
        
        creepManager.progressBar(0, 0, Game.rooms[n], Game.cpu.bucket / 10000)
        creepManager.room(n);
        towermgr.run(n)
        manufacturing.tick(n)
        roomVisualizer.visualizeOwn(Game.rooms[n])
        strManager.tick(Game.rooms[n])
        creepActions.room(Game.rooms[n])
        sqdManager.checkRoom(Game.rooms[n])
    },
    updateCritical: function (n) {
        if (!Memory.rooms[n].critical && Game.rooms[n].find(FIND_HOSTILE_CREEPS).length >= 2) {
            Memory.rooms[n].critical = true
            Game.notify("Room critical! Time:" + Game.time + ", Room: " + n)

            if (!sqdManager.isAssembling(Game.rooms[n])) {
                //sqdManager.assembleSquad(2, 0, "DEFEND", Game.rooms[n])
            }
        }
        else if (Memory.rooms[n].critical) {
            Memory.rooms[n].critical = false
        }
    },
    updateClaimRoom: function () {
        if (Game.rooms[Memory.claimRoom]) {
            if (Game.rooms[Memory.claimRoom.room].controller.owner != undefined && Memory.claimRoom.state == "claim") {
                Memory.claimRoom.state = "constructSpawn"
            }
        }
    },
    isOwn: function (rname) {
        let n = rname;
        if (Game.rooms[n].controller) {
            if (Game.rooms[n].controller.owner) {
                if (Game.rooms[n].controller.owner.username != "feoranis") {
                    let vis = Game.map.visual
                    vis.poly([
                        rp(25, 5, n),
                        rp(44, 44, n),
                        rp(6, 44, n)],
                        { fill: "#f0d807", opacity: 0.75, strokeWidth: 0 })
                    vis.line(rp(25, 15, n), rp(25, 30, n), { color: "#000000", width: 5, opacity: 1 })
                    vis.line(rp(25, 35, n), rp(25, 40, n), { color: "#000000", width: 5, opacity: 1 })
                    vis.text("UNRECOGNIZED ROOM!", rp(25, 45, n), { fontSize: 4 })
                    return false;
                }
                else {
                    return true
                }
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
};
function rp(x, y, room) {
    return new RoomPosition(x, y, room)
}