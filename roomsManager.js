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
                        continue;
                    }
                }
                else {
                    continue;
                }
            }
            else {
                continue;
            }// refactor into function

            roomConstruct.processRoom(Game.rooms[n])
            if (Memory.rooms[n] == undefined) {
                continue;
            }
            if (!Memory.rooms[n].readyToRun) {
                continue;
            }
            this.processOwn(n)
            this.updateClaimRoom()
        }
        
    },
    processOwn: function (n) {
        if (Game.time % 5 == 0) {
            if (Game.rooms[n].find(FIND_HOSTILE_CREEPS).length >= 2) {
                Memory.rooms[n].critical = true
                Game.notify("Room critical! Time:" + Game.time + ", Room: " + n)

                if(!sqdManager.isAssembling(Game.rooms[n])){
                    //sqdManager.assembleSquad(2, 0, "DEFEND", Game.rooms[n])
                }
            }
            else {
                Memory.rooms[n].critical = false
            }
        }
        creepManager.progressBar(0, 0, Game.rooms[n], Game.cpu.bucket / 10000)
        creepManager.room(n);
        towermgr.run(n)
        manufacturing.tick(n)
        roomVisualizer.visualizeOwn(Game.rooms[n])
        strManager.tick(Game.rooms[n])
        creepActions.room(Game.rooms[n])
        

        if (Memory.rooms[n].ldsEnabled && Game.time % 20 < 3) {
            for (let i in Memory.actions.ldsDangerous) {
                if (!Game.rooms[i]) {
                    let observers = Game.rooms[n].find(FIND_MY_STRUCTURES, {filter:(s)=>s.structureType == STRUCTURE_OBSERVER})
                    if (observers.length >= 1) {
                        observers[0].observeRoom(i)
                    }
                }
                else {
                    let hostiles = Game.rooms[i].find(FIND_HOSTILE_CREEPS);
                    if (hostiles.length == 0) {
                        Memory.actions.ldsDangerous[i] = false;
                    }
                }
            }
        }
    sqdManager.checkRoom(Game.rooms[n])
    },
    updateClaimRoom: function () {
        if (Game.rooms[Memory.claimRoom]) {
            if (Game.rooms[Memory.claimRoom.room].controller.owner != undefined && Memory.claimRoom.state == "claim") {
                Memory.claimRoom.state = "constructSpawn"
            }
        }
    }
};
function rp(x, y, room) {
    return new RoomPosition(x, y, room)
}