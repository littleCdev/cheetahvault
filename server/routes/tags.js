const routes = require('express').Router();

const Log = require('../log');
const cheetahFile = require("../file");
const asyncHandler = require("../functions/asyncHandler");



routes.use(require("../functions/access").userOnly);

/**
 * /tags/
 * returns all existing tags for autocomplete
 */
routes.get("/",asyncHandler(async(req,res,next)=>{
    let tags = await cheetahFile.getAllTags();

    res.send(tags);
}));

module.exports = routes;