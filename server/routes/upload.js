const routes = require('express').Router();


const Config = require("../config.json");
const Log = require('../log');
const cheetahFile = require("../file");

const multer  = require('multer')
const upload = multer({ dest: Config.temppath })

routes.use(require("../functions/access").userOnly);

/**
 * accepts a file as multipart/from
 * field: "file" -> file
 * field: "date" -> creatingdate of the file 
 */
routes.post("/",upload.single("file"),async function(req,res,next){
    try{
        await cheetahFile.newFile(req.file,req.body.date)
        res.send(newimage);

    }catch(e){
        res.status(500);
        res.send(e);
    }
});

module.exports = routes;