const routes = require('express').Router();
const Path = require('path');

const Log = require('../log');
const Config = require("../config.json");
const Share = require("../functions/share");
const Album = require("../functions/albums");
const File = require("../functions/file");
const asyncHandler = require("../functions/asyncHandler");


routes.use(require("../functions/access").public);


/**
 * does nothing right now
 */
routes.get("/",asyncHandler(async(req,res,next)=>{
    res.send("nothing at all");
}));


/**
 * enpoint to serve files
 * DIR1 and DIR2 are only to verify FILENAME
 * ORIGNALFILENAME is optional and not verified, it is only used for downloadlinks so browsers rename the file to given  name
 */
 routes.get("/f/:SHAREKEY/:DIR1/:DIR2/:FILENAME/:ORIGNALNAME",asyncHandler(async (req,res,next)=>{
    let givenpath = (req.params.DIR1||"")+"/"+(req.params.DIR2||"")+"/";

    if(!await Share.fileIsInShare(req.params.SHAREKEY,req.params.FILENAME))
        throw `invalid path`;

    let givenfilename = req.params.FILENAME||"";
    let filepath = await File.getFilePath(givenpath,givenfilename)
    //Log.debug(`filepath: ${filepath}`)
    let x = Path.join(__dirname,"../",Config.uploadpath,filepath);

    res.sendFile(x)    
}));


/**
 * gets a shared file or album
 */
 routes.get("/:KEY",asyncHandler(async(req,res,next)=>{
    let sharekey = req.params.KEY||'does not exist';

    let s = await Share.getShare(sharekey);

    let ret = {
        type:s.type,
        data:null
    };


    if(s.isAblbum){
        ret.data = await Album.getPublicAlbum(s.targetId);
    }else{
        ret.data = await File.getPublicFile({id:s.targetId});
    }

    res.send(ret);
})); 

module.exports = routes;