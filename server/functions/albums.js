const Config = require("../config.json");
const db = require("../db");
const Log = require("../log");
const rndStr = require("../rnd").filename;
const simpledate = require("../helpers").DatetimeToStr;


/**
 * creates a new album with given title
 * @param {string} title 
 * @returns {id,albumkey}
 */
async function craeteNew(title){

    if(title.length == 0)
        throw "title for this album is too short";

    let rndId = "";
    let keyExists = true;
    do{

        rndId = rndStr(32);
        let res = await db.all("select id from albums where albumkey=?",[rndId]);
        
        if(res.length > 0)
            keyExists = true;
        else
            keyExists = false;
    }while(keyExists)


    let res = await db.run("insert into albums (albumname,albumkey,albumdate,albumtime) values (?,?,?,?)",
    [
        title,
        rndId,
        simpledate((new Date()/1000)),
        ((new Date()/1000))
    ]);

    Log.info(`created new album with title: ${title} and id: ${res.lastID}`);

    return {id:res.lastID,key:rndId}
}

/**
 * adds an given file to an album
 * @param {int} albumid 
 * @param {int} fileid 
 */
async function addFile(albumid,fileid){
    let res = await db.all("select id from albums where id=?",[albumid]);
    if(res.length == 0)
        throw "album does not exist";
    
    await db.run("insert into albummap (fileid,albumid) values (?,?)",[
        fileid,
        albumid
    ]);
    Log.info(`added ${fileid} to ${albumid}`);
}
/**
 * removes a given file from an album
 * @param {int} albumid 
 * @param {int} fileid 
 */
async function removeFile(albumid,fileid){
    await db.run("delete from albummap where fileid=? and albumid=?",[
        fileid,
        albumid
    ]);
    Log.info(`removed ${fileid} from ${albumid}`);
}

/**
 * gets all existing albums
 * @returns {array}
 */
async function getAll(){
    let res = await db.all("select * from albums");

    return res;
}

/**
 * key to id
 * @param {string} key 
 * @returns {int} id
 */
async function keyToId(key){
    let res = await db.all("select id from albums where albumkey=?",[key]);

    if(res.length == 0)
        throw `album ${key} does not exist`;

    return res[0].id;
}

/**
 * gets all files for an given album(key)
 * @param {string} key 
 * @returns {Array}
 */
async function getFiles(key){
    let albumId = await keyToId(key);

    let images = await db.all("select files.* from files join albummap on albummap.fileid=files.id where albummap.albumid=?",[albumId]);

    return images;
}

/**
 * 
 * @param {int} id 
 * @returns {object} album info id,albumname,albumedate,albumtime,albumkey
 */
async function getInfo(id){
    let info = await db.all("select * from albums where id=?",[id]);

    if(info.length == 0)
        throw "album not found";

    return info[0];
}

async function setName(id,name){
    let res = db.run("update albums set albumname=? where id=?",[
        name,
        id
    ])

    if(res.changes != 1)
        throw `updated ${res.changes} rows but expected 1 for albumid:${id}`
}

/**
 * deletes the whole album
 * @param {int} id 
 */
async function deleteAlbum(id){
    // delete all files from album first
    let res = await db.run("delete from albummap where albumid=?",[id])
    Log.info(`removed ${res.changes} files from album  ${id}`);

    res = await db.run("delete from albums where id=?",[id]);
    Log.info(`deleted album ${id}`)
}

module.exports = {
    craeteNew,
    addFile,
    removeFile,
    getAll,
    keyToId,
    getFiles,
    getInfo,
    setName,
    deleteAlbum
}
