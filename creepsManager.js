
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
        this.spawnRoom(roomd);
        for (let jobn in this.jobs) {
            let job = this.jobs[jobn]
            if (job.runRoom) {
                job.runRoom(Game.rooms[roomd])
            }
        }
    },
    tick: function () {
        if (!this.codeInitialized) {
            console.log("[MGR] GLOBAL RESET!\nLag spike incoming...")
            this.codeInitialized = true
            Memory.globalResets++
        }
        if (this.jobs.length == 0) {//|| Game.time % 10 == 0) {
            console.log("[MGR] No jobs!")
            this.generateJobs();
        }

        for (let i in Game.creeps) {
            this.run(Game.creeps[i]);
        }
        for (let i in Game.creeps) {
            this.runPost(Game.creeps[i]);
        }

        if (Game.time % 5 == 0) {
            for (let i in Memory.creeps) {
                let c = Game.creeps[i]
                if (c == undefined) {
                    delete Memory.creeps[i];
                }
            }
        }
    },
    spawnRoom(roomd) {
        let room = Game.rooms[roomd];
        let spawnst = Memory.rooms[roomd].spawns
        let spawns = []
        for (let i in spawnst) {
            let spawn = Game.getObjectById(spawnst[i])
            if (spawn) {
                this.visualize(spawn);
                spawns.push(spawn)
            }
        }

        if (Game.time % 10 == 0) {
            let roomData = {
                name: roomd,
                roleNumbers: {

                }
            }

            let creeps = Game.rooms[roomd].find(FIND_MY_CREEPS)

            for (let creepNum in creeps) {
                let creep = creeps[creepNum];
                if (creep.memory && creep.memory.role && this.jobsData[creep.memory.role] != undefined) {
                    if (roomData.roleNumbers[creep.memory.role])
                        roomData.roleNumbers[creep.memory.role]++;
                    else
                        roomData.roleNumbers[creep.memory.role] = 1;
                }
            }



            if (spawns.length == 0) {
                console.log("[MGR] Spawn cache is invalid for room: " + roomd);
                this.refreshSpawns(roomd);
            }
            if (Game.time % 500 == 0) {
                console.log("[MGR] Spawn cache is being refreshed for room: " + roomd);
                this.refreshSpawns(roomd);
            }


            this.spawn(roomData, spawns)
        }
    },
    spawn: function (roomData, spawns) {
        //Cache role numbers for all roles so we don't calculate them for every job, this would save a lot of CPU
        let roomd = roomData.name
        let room = Game.rooms[roomd];

        let spawn = spawns[0];
        let alreadySpawning = false;
        for (let s in spawns) {
            let spawn_t = spawns[s]
            if (spawn_t.spawning && Game.creeps[spawn_t.spawning] && Game.creeps[spawn_t.spawning].memory.role == spawner.name) {
                alreadySpawning = true;
                break;
            }
            if (!spawn_t.spawning) {
                spawn = spawns[s]
            }
            break;
        }

        console.log(room.name)

        if (room.find(FIND_MY_CREEPS).length > 0) {
            if (!alreadySpawning) {
                if (this.jobs.length == 0) {
                    console.log("[MGR] No jobs!")
                    this.generateJobs();
                }



                for (let spawnerNum in this.jobs) {
                    let spawner = this.jobs[spawnerNum]
                    let num = roomData.roleNumbers[spawner.name] != undefined ? roomData.roleNumbers[spawner.name] : 0;

                    if (alreadySpawning || (spawn && spawner.spawn(room, spawn, num))) {
                        continue;
                    }

                    this.nextUp[roomd] = spawner.name
                    nextup = this.nextUp[roomd]
                    break;
                }
            }
            this.isRoomDead = false;
        }
        else {
            this.isRoomDead = true;
            console.log("[MGR] No Creeps.")
            Game.notify("Room died! Time:" + Game.time + ", Room: " + room)
            console.log("[MGR] Room died! Time:" + Game.time + ", Room: " + room)
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
                    console.log("[MGR] Exception at job " + job.name + " while running for " + creep.name + " at room " + creep.room.name + "!")
                    console.log("[MGR] Exception details: " + e + "  ##  " + e.stack)
                    Game.notify("Exception at job " + job.name + " while running for " + creep.name + "!");
                    Game.notify("Exception info: " + e + "  ##  " + e.stack + "\nCreep info :\nName : " + creep.name + "\nRoom : " + creep.room.name);
                }
            }
        }
    },
    refreshSpawns: function (roomd) {
        let room = Game.rooms[roomd]
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
        console.log("[MGR] Generating jobs.")
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
        this.jobs.push(rsrc);
        this.jobs.push(mnfc);
        this.jobs.push(pwpr);
        this.jobs.push(rmrv);
        //this.jobs.push(mnrl);
        this.jobs.push(pwrh);
        this.jobs.push(dest);

        for (let jobNum in this.jobs) {
            let job = this.jobs[jobNum];
            this.jobsData[job.name] = job;
        }
    },
    jobs: [],
    jobsData: {},
    visualize: function (spawn) {
        let pos = spawn.pos;
        let vis = spawn.room.visual;
        vis.line(pos.x, pos.y, pos.x - 1.5, pos.y, { fill: "red", opacity: 0.25 })
        if (spawn.spawning) {
            vis.text("Spawning:", pos.x - 3.5, pos.y - 0.125, { font: 0.25 });
            vis.text(spawn.spawning.name, pos.x - 3.5, pos.y + 0.25, { font: 0.25 });
            vis.rect(pos.x - 4.25, pos.y - 0.625, 2.875, 1.25, { fill: "gray", opacity: 0.125 })
        }
        else if (this.nextUp[spawn.room.name] != undefined) {
            vis.text("Next up:", pos.x - 3.5, pos.y - 0.125, { font: 0.25 });
            vis.text(this.nextUp[spawn.room.name], pos.x - 3.5, pos.y + 0.25, { font: 0.25 });
            vis.rect(pos.x - 4.25, pos.y - 0.625, 2.875, 1.25, { fill: "gray", opacity: 0.125 })
        }
        else {
            vis.rect(pos.x - 0.625, pos.y - 0.625, 1.25, 1.25, { fill: "gray", opacity: 0.125 })
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

