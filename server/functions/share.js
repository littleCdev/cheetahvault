
const Config = require("../config.json");
const db = require("../db");
const Log = require("../log");
const rndStr = require("../rnd").filename;
const simpledate = require("../helpers").DatetimeToStr;
const cheetahfile = require("../file");
const Album = require("./albums");


const SHARE_FILE = 0;
const SHARE_ALBUM = 1;

class share{
    id=-1;
    key="";
    type=-1;
    isAblbum = false;
    isFile = false;
    targetId = -1;
    sharetime = -1;
    sharedate = "";
}

/**
 * @description creates a new share for an given albumkey or filekey
 * @param {filekey,albumkey} params 
 * @returns {share}
 */
async function newShare(params={filekey:undefined,albumkey:undefined}){
    let targetid = undefined;
    let sharetype = undefined;

    if(params.filekey){
        targetid = await cheetahfile.keyToId(params.filekey);
        sharetype = SHARE_FILE;
        Log.debug(`sharing file: ${targetid}`);
    }else if(params.albumkey){
        targetid = await Album.keyToId(params.albumkey);
        sharetype = SHARE_ALBUM;
        Log.debug(`sharing album: ${targetid}`);
    }else{
        throw `you need to define filekey or albumkey`;
    }

    let sharekey = "";
    do{
        sharekey = rndStr(40);
        let res = await db.all("select * from shares where sharekey=?",[sharekey]);

        if(res.length==0)
            keyExists = false;
    }while(keyExists);

    Log.debug(`new sharekey: ${sharekey}`);
    let sharetime = (Math.floor(Date.now() / 1000));
    let sharedate = simpledate();

    let res = await db.run("insert into shares (targetid,sharetype,sharekey,sharetime,sharedate) values (?,?,?,?,?)",
    [
        targetid,
        sharetype,
        sharekey,
        sharetime,
        sharedate
    ]);

    if(sharetype == SHARE_FILE){
        Log.info(`created new fileshare for file ${params.filekey} / ${targetid}  with key ${sharekey}`);
    }else{
        Log.info(`created new albumshare for album ${params.albumkey} / ${targetid} with key ${sharekey}`);
    }

    let x = new share();
    x.id = res.lastID;
    x.key = sharekey;
    x.isAblbum = sharetype == SHARE_ALBUM?true:false;
    x.isFile = sharetype == SHARE_FILE?true:false;
    x.type = sharetype;
    x.targetId = targetid;
    x.sharetime = sharetime;
    x.sharedate = sharedate;


    return x;
}

/**
 * @description gets all existing shares for an album or filekey
 * @param {filekey,albumkey} params 
 * @returns {Array|share}
 */
 async function getSharesFor(params={filekey:undefined,albumkey:undefined}){
    let targetId = undefined;
    let sharetype = undefined;

    if(params.filekey){
        targetId = await cheetahfile.keyToId(params.filekey);
        sharetype = SHARE_FILE;
    }else{        
        targetId = await Album.keyToId(params.albumkey);
        sharetype = SHARE_ALBUM;
    }


    let res = await db.all(`select * from shares where targetid=? and sharetype=? order by id desc`,
    [
        targetId,
        sharetype
    ]);


    let ret = [];
    for (let i = 0; i < res.length; i++) {
        const element = res[i];

        let x = new share();
        x.id = element.id;
        x.key = element.sharekey;
        x.isAblbum = sharetype == SHARE_ALBUM?true:false;
        x.isFile = sharetype == SHARE_FILE?true:false;
        x.sharetype = sharetype;
        x.targetId = element.targetid;
        x.sharetime = element.sharetime;
        x.sharedate = element.sharedate;   
        
        ret.push(x);
    }

    return ret;
}


/**
 * @description deletes an existing share
 * @param {String} sharekey 
 */
async function revokeShare(sharekey){
    let res = await db.run(`delete from shares where sharekey=?`,[sharekey]);

    if(res.changes != 1)
        throw `share with key ${sharekey} does not exist`;
}

/**
 * @description gets an existing share
 * @param {String} sharekey 
 * @returns {share}
 */
async function getShare(sharekey){
    let res = await db.single(`select * from shares where  sharekey=?`,[sharekey]);

    if(res == null){
        Log.info(`share with key ${sharekey} does not exist`);
        throw "share does not exist";
    }

    let x = new share();
    x.id = res.id;
    x.key = res.sharekey;
    x.type = res.sharetype;
    x.isAblbum = res.sharetype == SHARE_ALBUM?true:false;
    x.isFile = res.sharetype == SHARE_FILE?true:false;
    x.targetId = res.targetid;
    x.sharetime = res.sharetime;
    x.sharedate = res.sharedate;   

    return x;
}

/**
 * @description checks if a filekey is part of given sharekey
 * @param {String} sharekey 
 * @param {string} filekey 
 * @returns {boolean}
 */
async function fileIsInShare(sharekey,filekey){
    let share = await getShare(sharekey);

    if(share.isFile){
        let query = "select * from files where filename=? and id=?";
        let res = await db.all(query,[filekey,share.targetId]);

        if(res.length > 0)
            return true;

        return false;
    }else{
        let query = "select * from files join albummap on files.id=albummap.fileid where albummap.ablumid=? and files.filename=?";
        let res = await db.all(query,[share.targetId,filekey])

        if(res.length > 0)
            return true;

        return false;
    }
}

module.exports = {
    SHARE_FILE,
    SHARE_ALBUM,
    newShare,
    getSharesFor,
    revokeShare,
    getShare,
    fileIsInShare
}