let roomsManager = require("roomsManager");
let creepsManager = require("creepsManager");
let pixelizer = require("pixelizer")  
let stat = require("stats")


let profiler = require('screeps-profiler');
//profiler.enable();

module.exports.loop = function () {
    profiler.wrap(function () {
        if (Game.cpu.bucket > 20) {
            creepsManager.tick()
            roomsManager.tick()
            //pixelizer.pixelize()
            stat.stats()
        }
        else {
            console.log("[CPU] FUCK!");
        }
    });
}