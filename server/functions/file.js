const fs = require("fs").promises;
const Path = require('path');

const getExif = require('exif-async');

const Config = require("../config.json");
const db = require("../db");
const Log = require("../log");
const rndStr = require("../rnd").filename;
const sharp = require('sharp');
const simpledate = require("../helpers").DatetimeToStr;
const humanfilesize = require("../helpers").humanFileSize;

const { promisify } = require('util')
const sizeOf = promisify(require('image-size'))

const cheetahimage = require("./imagepreview")
const cheetahvideo = require("./videopreview")

class thumnailinfo{
    x=0;
    y=0;
    file="";
}

/**
 * @description used for shared albums and files, does contain less info
 */
class publicFile{
    filetype="file";
    filedate="";
    imagex=0;
    imagey=0;
    orignalfilename="";

    filesize = "0";
    filename="";
    filepath="";

    thumbnail = new thumnailinfo();
    videopreview = new thumnailinfo();
}

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

/**
 * 
 * @param {file from express, req.file} reqFile 
 * @param {unixtimestamp} orignaldate 
 */
 let newFile = async(reqFile,orignaldate)=>{

    let orignalfilename = reqFile.originalname;
    let path = reqFile.path;
    let originalfileSize = reqFile.size;
    let originalfileSizeStr = humanfilesize(originalfileSize);


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

    let dbres = await db.run("insert into files (originalfilename,filename,filepath,uploadtime,filetype,filedate,filetime,filesize,filesizestr) values (?,?,?,?,?,?,?,?,?)",
    [
        orignalfilename,
        newfilename,
        dir,
        ((new Date()/1000)),
        filetype,
        originaldatestr,
        orignaldate,
        originalfileSize,
        originalfileSizeStr
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

        Log.info(`new exifdate: ${exifdate}`)
    }catch(e){
        Log.info(`exif failed for ${newfilename}`);
        Log.info(e);
    }
    await db.run("update files set sortdate=? where id=?",
    [
        (exifdate?exifdate:originaldatestr),
        id
    ]);

    return id;
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
    
        images = await db.all(`select f.* from  files f left join tagmap tm on f.id=tm.imageid where tm.tagid in (${ids}) or f.originalfilename  like ? group by f.id order by f.sortdate ASC limit ? offset ?;`,[`%${search}%`,n,n*page])
    }else{
        images = await db.all("select * from files where showinindex=1 order by sortdate ASC limit ? offset ?",[n,n*page]);
    }

    return images;
}


/**
 * @param {string} givenpath uploaddir to check against 
 * @param {string} filename or thumbname or videopreview
 * @returns {string} filepath+filename (without uploadpath)
 */
let getFilePath = async(givenpath,filename)=>{
    //Log.debug(`searching for ${filename}`)
    let res = await db.all("select filepath from files where filename=? or thumbnail=? or videopreview=?",[filename,filename,filename]);

    if(res.length !== 1){
        Log.warn(`file ${filename} was not found in database`);
        throw "file not found";
    }

    let path = res[0].filepath;
    if(path!= givenpath){
        Log.warn(`file ${filename}  paths did not match: ${path} != ${givenpath}`);
        throw "file not found";
    }


    return path+filename;
}

/**
 * key is equal to filename
 * @param {string} key 
 * @returns {int} id
 */
 async function keyToId(key){
    let res = await db.all("select id from files where filename=?",[key]);

    if(res.length == 0)
        throw `File ${key} does not exist`;

    return res[0].id;
}
/**
 * key is equal to filename
 * @param {Array|String} keys 
 * @returns {Array} id
 */
 async function keysToIds(keys=[]){
    let res = await db.all(`select id,filename from files where filename in (${ keys.map(() => "?").join(",") })`,keys);

    if(res.length != keys.length)
        throw `at least one filekey does not exist: ${res.length} != ${keys.length}`;

    return res;
}

/**
 * Deletes a given fileid with all tags, albums and thumbnails
 * @param {Number} id 
 */
async function deleteFile(id){
    Log.info(`deleteing file with id: ${id}`);

    let file = await db.single("select * from files where id=?",[id])

    if(file == null){
        Log.critical(`tried to delete file with id ${id} but it does not exist`);
        throw `file ${id} does not exist`;
    }

    let res = await db.run("delete from albummap where fileid=?",[id])
    Log.debug(`removed file ${id} from ${res.changes} albums`);

    res = await db.run("delete from tagmap where imageid=?",[id])
    Log.debug(`removed ${res.changes} tags from file ${id}`);

    if(file.thumbnail.length > 0){
        Log.debug(`deleting thumbmail for file ${id}`)
        await fs.unlink(Path.join(Config.uploadpath,file.filepath,file.thumbnail));
        Log.debug(`deleted thumbmail for file ${id}`)
    }else{
        Log.debug(`file ${id} has no thumbnail`)
    }
    

    if(file.videopreview.length > 0){
        Log.debug(`deleting videopreview for file ${id}`)
        await fs.unlink(Path.join(Config.uploadpath,file.filepath,file.videopreview));
        Log.debug(`deleted videopreview for file ${id}`)
    }else{
        Log.debug(`file ${id} has no videopreview`)
    }

    if(file.filename.length > 0){
        Log.debug(`deleting file for file ${id}`)
        await fs.unlink(Path.join(Config.uploadpath,file.filepath,file.filename));
        Log.debug(`deleted file for file ${id}`)
    }else{
        Log.debug(`file ${id} has no file`)
    }

    res = await db.run("delete from files where id=?",[id]);
    if(res.changes != 1){
        Log.critical(`tried to delete file ${id}  from database but only deleted ${res.changes} rows`)
        throw `failed to delete file`;
    }
    Log.info(`deleted file ${id}`)
}

/**
 * 
 * @param {object} params.id or params.key 
 * @returns {publicFile}
 */
async function getPublicFile(params={id:undefined,key:undefined}){
    if(params.id && params.key)
        throw "only id OR key allowed, not both";
    if(!params.id && !params.key)
        throw "no id nor key provided";
    
    let isKey = params.id?true:false;

    let query= isKey?  `select * from files where id=?`:`select * from files where key=?`;
    let queryparams = isKey?  [params.id]:[params.key];

    let element = await db.single(query,queryparams);

    let tmp = new publicFile();

    tmp.filetype = element.filetype;
    tmp.filedate = element.filedate;
    tmp.imagex = element.imagex;
    tmp.imagey = element.imagey;
    
    tmp.orignalfilename = element.orignalfilename;
    
    tmp.filepath = element.filepath;
    tmp.filename= element.filename;
    tmp.filesize = element.filesizestr;

    tmp.thumbnail.x = element.thumbnailx;
    tmp.thumbnail.y = element.thumbnaily;
    tmp.thumbnail.file = element.thumbnail;

    tmp.videopreview.x = element.videopreviewx;
    tmp.videopreview.y = element.videopreviewy;
    tmp.videopreview.file = element.videopreview;


    return tmp;
}

module.exports={
    publicFile,
    deleteFile,
    getlatest,
    newFile,
    makePrivate,
    setTags,
    getTags,
    getAllTags,
    getFilePath,
    keyToId,
    keysToIds,
    getPublicFile
}