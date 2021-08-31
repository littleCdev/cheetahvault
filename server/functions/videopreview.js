const Config = require("../config.json");
const db = require("../db");
const Log = require("../log");

const fs = require("fs").promises;
const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');


const { promisify } = require('util')
const sizeOf = promisify(require('image-size'))

const rndStr = require("../rnd").filename;


function getThumbnailFromVideo(dir,file){
    let thumbfile = "";
    return new Promise((resolve,reject)=>{
        ffmpeg(dir+file)
        .on("filenames",(f)=>{
            thumbfile = f[0];
        })
        .on("end",()=>{
            resolve(thumbfile);
        })
        .on("error",(e)=>{
            reject(e);
        })
        .screenshots({
            count:1,
            folder:dir
        })        
    })
}


async function createVideoScreenshot(id,dir,file){
    let videopreview = await getThumbnailFromVideo(dir,file);
    let newname = rndStr(10,file);

    await fs.rename(dir+videopreview,dir+newname);

    let dimensions = await sizeOf(dir+newname);

    x = dimensions.width;
    y = dimensions.height;

    await db.run("update files set videopreview=?,videopreviewx=?,videopreviewy=? where id=?",
    [
        newname,
        dimensions.width,
        dimensions.height,
        id
    ]);

    return newname;
}

async function createGalleryThumb(id,dir,file){

    let thumbname = rndStr(10)+".webp";

    await sharp(dir+file)
    .resize(200,200)
    .composite([{input:"./files/playbutton.png"}])
    .toFile(dir+thumbname);
    
    await db.run("update files set thumbnail=?,thumbnailx=?,thumbnaily=? where id=?",
    [
        thumbname,
        200,
        200,
        id
    ])
}

module.exports={
    createGalleryThumb,
    createVideoScreenshot
}