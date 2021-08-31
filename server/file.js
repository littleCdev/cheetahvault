const fs = require("fs").promises;
const getExif = require('exif-async');

const Config = require("./config.json");
const db = require("./db");
const Log = require("./log");
const rndStr = require("./rnd").filename;
const sharp = require('sharp');
const simpledate = require("./datehelper").toStr;

const { promisify } = require('util')
const sizeOf = promisify(require('image-size'))

const cheetahimage = require("./functions/imagepreview")
const cheetahvideo = require("./functions/videopreview")

class cheetafile {

    id=0;

    originalfilename="";

    filename="";
    filepath="";

    thumbnail="";
    thumbnailpath = "";

    uploadtime="";
}

function fileExtension(filename){
    let dot = filename.lastIndexOf(".");
    if(dot>0){
        return filename.substr(dot+1);
    }
    return "";
}

let newFile = async(orignalfilename,path,orignaldate)=>{
try{
    let newfilename = rndStr(10,orignalfilename);
    let dir =  newfilename.substr(0,2)+"/"+newfilename.substr(1,2)+"/";

    await fs.mkdir(Config.uploadpath+dir,{recursive:true});
    await fs.rename(path,Config.uploadpath+dir+newfilename);

    let extension = fileExtension(orignalfilename);

    let filetype = "file"; // pdf|video|image|file
    switch(extension.toLowerCase())
    {
        case "mp4": filetype="video";break;
        case "mov": filetype="video";break;
        case "webm": filetype="video";break;
        case "wmv": filetype="video";break;
        case "mpg": filetype="video";break;
        case "avi": filetype="video";break;

        case "jpeg": filetype="image";break;
        case "jpg": filetype="image";break;
        case "png": filetype="image";break;
        case "gif": filetype="image";break;
        case "bmp": filetype="image";break;
        case "webp": filetype="image";break;
        case "heic": filetype="image";break;

        case "cr2": filetype="file";break;
        default: filetype = "file";break;
    }


    let originaldatestr = simpledate(orignaldate);

    let dbres = await db.run("insert into files (originalfilename,filename,filepath,uploadtime,filetype,filedate,filetime) values (?,?,?,?,?,?,?)",
    [
        orignalfilename,
        newfilename,
        dir,
        ((new Date()/1000)),
        filetype,
        originaldatestr,
        orignaldate
    ]);

    let id = dbres.lastID;

    Log.info(`added new file with id ${id}`)

    if(filetype == "image"){
        try {
            await cheetahimage.thumbnail(id,Config.uploadpath+dir,newfilename);
            Log.info(`created thumb for ${id}`);
        } catch (error) {
            Log.critical(`failed to create thumbnail for ${id}`);
            Log.critical(e);
        }

        try {
            await cheetahimage.imagesize(id,Config.uploadpath+dir,newfilename);
            Log.info(`got imagesize for ${id}`);
        } catch (error) {
            Log.critical(`failed to get imagesize for ${id}`);
            Log.critical(error);
        }        
    }else if(filetype == "video")
    {
        try{
            let screenshot = await cheetahvideo.createVideoScreenshot(id,Config.uploadpath+dir,newfilename);
            Log.info(`got screenshot for ${id}`);
            await cheetahvideo.createGalleryThumb(id,Config.uploadpath+dir,screenshot);
            Log.info(`created GalleryThumb for ${id}`);
        }catch(e){
            Log.critical(`failed to get screenshot for ${id}`);
            Log.critical(e);
        }
    }

    let exifdate = null;
    try{
        let exif = await getExif(Config.uploadpath+dir+newfilename)
        exifdate = exif.image.ModifyDate;
        
        let parts = exifdate.split(" ");
        let _date = parts[0].split(":").join("-"); // too lazy for regex

        exifdate = _date+" "+parts[1];

        console.log(`new exifdate: ${exifdate}`)
    }catch(e){
        Log.info(`exif failed for ${newfilename}`);
        Log.info(e);
    }
    await db.run("update files set sortdate=? where id=?",
    [
        (exifdate?exifdate:originaldatestr),
        id
    ]);




}catch(e){
    console.log(e);
    throw e;
}

}


async function makePrivate(file,private=true){
    let res = await db.run("update files set showinindex=? where filename=?",
    [
        (private?0:1),
        file
    ]);

    Log.info("update files set showinindex=? where filename=?")
    Log.info([
        (private?0:1),
        file
    ])
    
    Log.info(`updated ${res.changes} rows`)

    if(res.changes != 1){
        throw `id does not exist? updated ${res.changes} rows`;
    }
}

async function setTags(id,tags=[]){
    let res = await db.run("delete from tagmap where imageid=?",[id]);
    Log.info(`removed ${res.changes} tags from image ${id}`);

    let tagswithid = [];

    for (let i = 0; i < tags.length; i++) {
        const tagname = tags[i];

        let tag = await db.all("select * from tags where name=?",[tagname]);
    
        if(tag.length == 0){
            let newtag = await db.run("insert into tags (name) values (?)",[tagname]);
            tagswithid.push({
                id:newtag.lastID,
                name:tagname
            });
        }else{
            tagswithid.push(tag[0]);
        }
    }

    for (let i = 0; i < tagswithid.length; i++) {
        let tag = tagswithid[i];
        await db.run("insert into tagmap (imageid,tagid) values (?,?)",[id,tag.id]);
    }

    console.log(tagswithid);

}

async function getTags(id){
    let tags = await db.all("select tags.name from tags join tagmap on tagmap.tagid=tags.id where tagmap.imageid=?",[id]);

    let ret = [];
    for (let i = 0; i < tags.length; i++) {
        const element = tags[i];
        ret.push(element.name);
    }
    return ret;
}

async function getAllTags(id){
    let tags = await db.all("select name from tags");

    let ret = [];
    for (let i = 0; i < tags.length; i++) {
        const element = tags[i];
        ret.push(element.name);
    }
    return ret;
}


let getlatest = async (search="",page=0,n=20)=>{

    let images =  [];

    if(search.length>0){
        Log.info(`searching for: ${search}`)
        let res = await db.all("select id from tags where name like ? ",["%"+search+"%"]);

        let ids = "";
        for (let i = 0; i < res.length; i++) {
            const element = res[i];
            ids+=element.id+",";
        }
        ids = ids.substr(0,ids.length-1);
        Log.info(`searching for: ${search} ids: ${ids}`)
    
        images = await db.all(`select f.* from  files f join tagmap tm on f.id=tm.imageid where tm.tagid in (${ids}) group by f.id limit ? offset ?;`,[n,n*page])

    }else{
        images = await db.all("select * from files where showinindex=1 limit ? offset ?",[n,n*page]);
    }

    return images;
}

module.exports={
    getlatest,
    newFile,
    makePrivate,
    setTags,
    getTags,
    getAllTags
}