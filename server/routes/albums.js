const routes = require('express').Router();

const Log = require('../log');
const Config = require("../config.json");
const Albums = require("../functions/albums");
const Files = require("../file");
const { login } = require('../functions/users');

routes.use(require("../functions/access").userOnly);


/**
 * exposes all existing albums
 */
routes.get("/",async(req,res,next)=>{
    let all = await Albums.getAll();
    res.send(all);
});

/**
 * creates a new album
 * body->title
 * returns id and key of new album
 */
routes.put("/",async(req,res,next)=>{
    try{
        let album = await Albums.craeteNew(req.body.title||'untitled album');

        if(req.body.files){
            for (let i = 0; i < req.body.files.length; i++) {
                const fileKey = req.body.files[i];

                let fileId = await Files.keyToId(fileKey);

                await Albums.addFile(album.id,fileId)
            }
        }

        res.send(album);
    }catch(e){
        console.log(e);
        res.status(500);
        res.send(e);
    }
});

/**
 * returns info and files from given album
 */
 routes.get("/:KEY/",async(req,res,next)=>{
    try{
        let id = await Albums.keyToId(req.params.KEY);

        let info = await Albums.getInfo(id);
        info.files = await Albums.getFiles(req.params.KEY);
        res.send(info)
    }catch(e){
        console.log(e);
    }
})


/**
 * adds an given file to an album
 */
routes.put("/:KEY/files",async(req,res,next)=>{
    Log.info(`adding the following files to ${req.params.KEY}`);
    Log.info(req.body.files);

    try{
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

            await Albums.addFile(albumId,fileId)
        }
        
        res.send()
    }catch(e){
        console.log(e);
    }
})

routes.put("/:KEY/name",async(req,res,next)=>{
    Log.info(`updating name for ${req.params.KEY} to ${req.body.title}`);
    try {
        
        let albumId = await Albums.keyToId(req.params.KEY);
        await Albums.setName(albumId,req.body.title||"untitled album");
    } catch (error) {
        Log.error(error);
        res.status(500);
        res.send(error);
    }
});

/**
 * removes an given file to an album
 */
routes.put("/:KEY/:FILE",async(req,res,next)=>{
    Log.debug(`tryin to add ${req.params.FILE} to album: ${req.params.KEY}`);
    try{
        let albumId = Albums.keyToId(req.params.KEY);
        let fileId = Files.keyToId(req.params.FILE);
    
        await Albums.removeFile(albumId,fileId)
        res.send()
    }catch(e){
        console.log(e);
    }
})

/**
 * returns tags of an file
 */
 routes.get("/:ID/tags",async(req,res,next)=>{
    try{
        let tags = await cheetahFile.getTags(req.params.ID);
        res.send(tags);
    }catch(e){
        console.log(e);
        res.status(500);
        res.send("nok");
    }
})

module.exports = routes;