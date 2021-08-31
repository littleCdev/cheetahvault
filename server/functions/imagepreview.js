const Config = require("../config.json");
const db = require("../db");
const Log = require("../log");
const rndStr = require("../rnd").filename;

const sharp = require('sharp');

const { promisify } = require('util')
const sizeOf = promisify(require('image-size'))

async function thumbnail(id,dir,file){
    let tx=0,ty=0;
    try{
        let thumbfile = rndStr(12)+".webp";
        console.log(`creating new thumbnail: ${thumbfile}`)
        let res = await sharp(dir+file)
            .resize(200,200)
            .toFile(dir+thumbfile);
    
            console.log(`created new thumbnail: ${thumbfile}`)
            console.log(res);
        // 200x200 is hardcoded
        tx=200;
        ty=200;
        
        await db.run("update files set thumbnail=?,thumbnailx=?,thumbnaily=? where id=?",
        [
            thumbfile,
            tx,
            ty,
            id
        ]);

    }catch(e){
        Log.critical(`failed to create thumb for ${file}`)
        Log.critical(e);
    }
}


async function imagesize(id,dir,file){
    let x=0,y=0;
    try{
        let dimensions = await sizeOf(dir+file);

        x = dimensions.width;
        y = dimensions.height;

        
        await db.run("update files set imagex=?,imagey=? where id=?",
        [
            x,
            y,
            id
        ]);

    }catch(e){
        Log.info(`exif sizeOf for ${file}`);
        Log.critical(e);
    }
}


module.exports={
    thumbnail,
    imagesize
}