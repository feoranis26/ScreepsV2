module.exports = {
    name: "pixelizer"
    ,
    pixelize: function () {
        if (Game.cpu.bucket >= 9900) {
            console.log("Generating pixel...")
            Game.cpu.generatePixel();
        }
    }
};