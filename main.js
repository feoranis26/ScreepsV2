let roomsManager = require("roomsManager");
let creepsManager = require("creepsManager");
let pixelizer = require("pixelizer")  
let stat = require("stats")
let codeInitialized = false
let cpuWarn
let cpuLowWarn
module.exports.loop = function () {
    creepsManager.tick()
    roomsManager.tick()
    //pixelizer.pixelize()
    stat.stats()
}