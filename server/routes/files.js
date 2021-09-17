const Path = require('path');

const routes = require('express').Router();

const Log = require('../log');
const Config = require("../config.json");
const cheetahFile = require("../file");
const asyncHandler = require("../functions/asyncHandler");


routes.use(require("../functions/access").userOnly);



/**
 * enpoint to serve files
 * DIR1 and DIR2 are only to verify FILENAME
 * ORIGNALFILENAME is optional and not verified, it is only used for downloadlinks so browsers rename the file to given  name
 */
 routes.get("/:DIR1/:DIR2/:FILENAME/:ORIGNALNAME?",asyncHandler(async (req,res,next)=>{
    let givenpath = (req.params.DIR1||"")+"/"+(req.params.DIR2||"")+"/";

    let givenfilename = req.params.FILENAME||"";
    let filepath = await cheetahFile.getFilePath(givenpath,givenfilename)
    //Log.debug(`filepath: ${filepath}`)
    let x = Path.join(__dirname,"../",Config.uploadpath,filepath);

    res.sendFile(x)    
}));

/**
 * marks a given ID as private
 */
routes.put("/:ID/hidden",asyncHandler(async(req,res,next)=>{
    await cheetahFile.makePrivate(req.params.ID,true);
    res.send();
}))


/**
 * deletes all files given in files(array)
 */
 routes.post("/deletemany",asyncHandler(async(req,res,next)=>{
    let idsAndKeys = await cheetahFile.keysToIds(req.body.files||[]);

    for (let i = 0; i < idsAndKeys.length; i++)
        await cheetahFile.deleteFile(idsAndKeys[i].id);

    res.send("ok");
}));


/**
 * marks a given ID as public
 */
routes.delete("/:ID/hidden",asyncHandler(async(req,res,next)=>{
    await cheetahFile.makePrivate(req.params.ID,false);
    res.send();
}));

/**
 * sets tags to a file, exiting tags will be removed and replaced by ginven array
 * use an emptyarray to "delete"
 */
routes.put("/:ID/tags",asyncHandler(async(req,res,next)=>{
    await cheetahFile.setTags(req.params.ID,req.body.tags);
    res.send();
}));

/**
 * returns tags of an file
 */
routes.get("/:ID/tags",asyncHandler(async(req,res,next)=>{
    let tags = await cheetahFile.getTags(req.params.ID);
    res.send(tags);
}))

module.exports = routes;