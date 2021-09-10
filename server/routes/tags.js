const routes = require('express').Router();

const Log = require('../log');
const cheetahFile = require("../file");



routes.use(require("../functions/access").userOnly);

/**
 * /tags/
 * returns all existing tags for autocomplete
 */
routes.get("/",async(req,res,next)=>{
    try{
        let tags = await cheetahFile.getAllTags();

        res.send(tags);
    }catch(e){
        console.log(e);
        res.status(500);
        res.send(e);
    }
})

module.exports = routes;