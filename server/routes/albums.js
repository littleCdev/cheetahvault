const routes = require('express').Router();

const Log = require('../log');
const Config = require("../config.json");
const Albums = require("../functions/albums");
const Files = require("../functions/file");
const asyncHandler = require("../functions/asyncHandler");


routes.use(require("../functions/access").userOnly);


/**
 * exposes all existing albums
 */
routes.get("/",asyncHandler(async(req,res,next)=>{
    let all = await Albums.getAll();
    res.send(all);
}));

/**
 * creates a new album
 * body->title
 * returns id and key of new album
 */
routes.put("/",asyncHandler(async(req,res,next)=>{
    let album = await Albums.craeteNew(req.body.title||'untitled album');

    if(req.body.files){
        for (let i = 0; i < req.body.files.length; i++) {
            const fileKey = req.body.files[i];

            let fileId = await Files.keyToId(fileKey);

            await Albums.addFile(album.id,fileId)
        }
    }

    res.send(album);
}));

/**
 * returns info and files from given album
 */
 routes.get("/:KEY/",asyncHandler(async(req,res,next)=>{
    let id = await Albums.keyToId(req.params.KEY);

    let info = await Albums.getInfo(id);
    info.files = await Albums.getFiles(req.params.KEY);
    res.send(info)
}))


/**
 * adds an given file to an album
 */
 routes.put("/:KEY/files",asyncHandler(async(req,res,next)=>{
    Log.info(`adding the following files to ${req.params.KEY}`);
    Log.info(req.body.files);

    if(typeof req.body.files != "object")
        throw `files needs to be an array (${typeof req.body.files})`;
    for (let i = 0; i < req.body.files.length; i++) {
        if(typeof req.body.files[i] != "string")
            throw `only strings allowed for filekeys (${typeof req.body.files[i]})`;
    }
    
    let albumId = await Albums.keyToId(req.params.KEY);

    // fileIds = [{id,key},{id,key}...]
    let fileIds = await Files.keysToIds(req.body.files);
    Log.debug(fileIds)
    // fileIdsOnly = [id,id,id,id,...]
    let fileIdsOnly = [];
    for (let i = 0; i < fileIds.length; i++) 
        fileIdsOnly.push(fileIds[i].id);

    await Albums.addFiles(albumId,fileIdsOnly);

    res.send()
}))
/**
* ´removes an given file to an album
*/
routes.post("/:KEY/files",asyncHandler(async(req,res,next)=>{
    Log.info(`removing the following files from ${req.params.KEY}`);
    Log.info(req.body.files);
 
    if(typeof req.body.files != "object")
        throw `files needs to be an array (${typeof req.body.files})`;
    for (let i = 0; i < req.body.files.length; i++) {
        if(typeof req.body.files[i] != "string")
            throw `only strings allowed for filekeys (${typeof req.body.files[i]})`;
    }
    
    let albumId = await Albums.keyToId(req.params.KEY);

    for (let i = 0; i < req.body.files.length; i++) {
        const fileKey = req.body.files[i];

        let fileId = await Files.keyToId(fileKey);

        await Albums.removeFile(albumId,fileId)
    }
    
    res.send()
 }))
/**
 * deletes the album
 */
routes.delete("/:KEY/",asyncHandler(async(req,res,next)=>{
    Log.info(`deleting the following album to ${req.params.KEY}`);
 

    let albumId = await Albums.keyToId(req.params.KEY);
    await Albums.deleteAlbum(albumId);
    res.send()

 }))
  
routes.put("/:KEY/name",asyncHandler(async(req,res,next)=>{
    Log.info(`updating name for ${req.params.KEY} to ${req.body.title}`);
    let albumId = await Albums.keyToId(req.params.KEY);
    await Albums.setName(albumId,req.body.title||"untitled album");

}));


module.exports = routes;