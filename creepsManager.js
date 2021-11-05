
let harv = require("harvester");
let carry = require("energyCarrier");
let upgr = require("upgrader");
let bldr = require("builder");
let repr = require("repairer");
let clmr = require("claimer")
let mele = require("melee");
let heal = require("healer")
let wlrp = require("wallrep")
let rmst = require("claimer")
let rmrv = require("roomReviver")
let rmrs = require("reserver")
let mnrl = require("mineralHarvester")
let pwrh = require("powerHarvester")
let mnfc = require("manufacturer")
let pwpr = require("powerProcessor");
let rsrc = require("resourceHarvester");
let long = require("longDistanceHarvester");
let dest = require("destroyer");


let nextup = {}
module.exports = {
    name: "creepsManager",
    isRoomDead: false,
    nextUp: {},
    codeInitialized: false,
    room: function (roomd) {
        this.spawn(roomd)
        for (let jobn in this.jobs) {
            let job = this.jobs[jobn]
            if (job.runRoom) {
                job.runRoom(Game.rooms[roomd])
            }
        }
    },
    tick: function () {
        if (!this.codeInitialized) {
            console.log("GLOBAL RESET!\nLag spike incoming...")
            this.codeInitialized = true
            Memory.globalResets++
        }
        if (this.jobs.length == 0) {//|| Game.time % 10 == 0) {
            console.log("No jobs!")
            this.generateJobs();
        }
        for (let i in Game.creeps) {
            this.run(Game.creeps[i]);
        }
        for (let i in Game.creeps) {
            this.runPost(Game.creeps[i]);
        }
        if (Game.time % 5 != 0) { return; }
        for (let i in Memory.creeps) {
            let c = Game.creeps[i]
            if (c == undefined) {
                delete Memory.creeps[i];
            }
        }
    },
    spawn: function (roomd) {
        //Cache role numbers for all roles so we don't calculate them for every job, this would save a lot of CPU
        let room = Game.rooms[roomd];
        let spawnst = Memory.rooms[roomd].spawns
        let spawns = []
        for (let i in spawnst) {
            let spawn = Game.getObjectById(spawnst[i])
            if (spawn) {
                spawns.push(spawn)
            }
        }
        let spawn;
        if (spawns.length > 0) {
            for (let s in spawns) {
                spawn = spawns[s]
                this.visualize(spawn);
                if (!spawn.spawning) {
                    break
                }
            }
        }
        else {
            console.log("Spawn cache is invalid for room: " + roomd);
            refreshSpawns(roomd);
        }
        if (Game.time % 500 == 0) {
            console.log("Spawn cache is being refreshed for room: " + roomd);
            refreshSpawns(roomd);
        }
        if (Game.time % 10 != 0) { return }
        //console.log(spawn)
        let roomType = "small"
        if (room.find(FIND_MY_CREEPS)[0]) {
            if (this.jobs.length == 0) {
                console.log("No jobs!")
                this.generateJobs();
            }
            for (let spawnerNum in this.jobs) {
                let spawner = this.jobs[spawnerNum]
                if (spawner.spawn(room, spawn)) {
                    continue;
                }
                if (this.nextUp[roomd] != spawner.name) {
                    this.nextUp[roomd] = spawner.name
                    nextup = this.nextUp[roomd]
                }
                break;
            }
            this.isRoomDead = false;
        }
        else if (!this.isRoomDead) {
            this.isRoomDead = true;
            console.log("No Creeps.")
            Game.notify("Room died! Time:" + Game.time + ", Room: " + room)
            console.log("Room died! Time:" + Game.time + ", Room: " + room)
            rmrv.spawn(room, spawn, "dead")
        }
    },
    run: function (creep) {
        for (let jobNum in this.jobs) {
            let job = this.jobs[jobNum]
            //if(job>8){return}
            if (job.name == creep.memory.role) {
                try {
                    job.run(creep)
                }
                catch (e) {
                    console.log("Exception at job " + job.name + " while running for " + creep.name + " at room " + creep.room.name + "!")
                    console.log("Exception details: " + e + "  ##  " + e.stack)
                    Game.notify("Exception at job " + job.name + " while running for " + creep.name + "!");
                    Game.notify("Exception info: " + e + "  ##  " + e.stack + "\nCreep info :\nName : " + creep.name + "\nRoom : " + creep.room.name);
                }
            }
        }
    },
    refreshSpawns: function (roomd) {
        Memory.rooms[roomd].spawns = []
        let spawnsr = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_SPAWN })
        for (let i in spawnsr) {
            Memory.rooms[roomd].spawns.push(spawnsr[i].id)
        }
    },
    runPost: function (creep) {
        switch (creep.memory.role) {
            case "harvester":
                harv.runPost(creep);
                break;
        }
    },
    progressBar: function (x, y, room, progress) {
        let vis = room.visual;
        vis.rect(x, y, 1, 0.25, { fill: "green" });
        vis.rect(x, y, (1 - (progress / 1)) * 1, 0.25, { fill: "red", opacity: 1 })
    },
    generateJobs: function () {
        console.log("Generating jobs, prepare for CPU spike!")
        this.jobs.push(carry);
        this.jobs.push(harv);
        this.jobs.push(upgr);
        this.jobs.push(wlrp);
        this.jobs.push(repr);
        this.jobs.push(mele);
        this.jobs.push(long);
        this.jobs.push(bldr);
        this.jobs.push(rmst);
        ////this.jobs.push(clrf);
        this.jobs.push(heal);
        this.jobs.push(rmrs);
        //this.jobs.push(rsrc);
        this.jobs.push(mnfc);
        this.jobs.push(pwpr);
        this.jobs.push(rmrv);
        //this.jobs.push(mnrl);
        this.jobs.push(pwrh);
        this.jobs.push(dest);
    },
    jobs: [],
    visualize: function (spawn) {
        let pos = spawn.pos;
        let vis = spawn.room.visual;
        vis.line(pos.x, pos.y, pos.x - 1.5, pos.y, { fill: "red", opacity: 0.25 })
        if (spawn.spawning) {
            vis.text("Spawning:", pos.x - 3.5, pos.y - 0.125, { font: 0.25 });
            vis.text(spawn.spawning.name, pos.x - 3.5, pos.y + 0.25, { font: 0.25 });
            vis.rect(pos.x - 4.25, pos.y - 0.625, 2.875, 1.25, { fill: "gray", opacity: 0.125 })
        }
        else {
            vis.text("Next up:", pos.x - 3.5, pos.y - 0.125, { font: 0.25 });
            vis.text(this.nextUp[spawn.room.name], pos.x - 3.5, pos.y + 0.25, { font: 0.25 });
            vis.rect(pos.x - 4.25, pos.y - 0.625, 2.875, 1.25, { fill: "gray", opacity: 0.125 })
        }


        vis.text("Energy:", pos.x - 2, pos.y - 0.25, { font: 0.25 });
        vis.text(spawn.room.energyAvailable, pos.x - 2, pos.y, { font: 0.25 });
        progressBar(pos.x - 2.5, pos.y + 0.125, spawn.room, spawn.room.energyAvailable / spawn.room.energyCapacityAvailable);
    },
    hash: function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16) }
};
function progressBar(x, y, room, progress) {
    let vis = room.visual;
    vis.rect(x, y, 1, 0.25, { fill: "green" });
    vis.rect(x, y, (1 - (progress / 1)) * 1, 0.25, { fill: "red", opacity: 1 })
}

