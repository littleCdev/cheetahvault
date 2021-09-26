const routes = require('express').Router();

const Log = require('../log');
const Config = require("../config.json");
const Share = require("../functions/share");
const asyncHandler = require("../functions/asyncHandler");


routes.use(require("../functions/access").userOnly);


/**
 * does nothing right now
 */
routes.get("/",asyncHandler(async(req,res,next)=>{
    res.send("nothing at all");
}));


/**
 * creates a new share for an album
 * body -> key
 */
routes.put("/album",asyncHandler(async(req,res,next)=>{
    let albumkey = req.body.key||'does not exist';

    let s = await Share.newShare({albumkey});

    res.send(s);
}));

/**
 * creates a new share for an single file
 * body -> key
 */
 routes.put("/file",asyncHandler(async(req,res,next)=>{
    let filekey = req.body.key||'does not exist';

    let s = await Share.newShare({filekey});

    res.send(s);
}));


/**
 * gets a list of all creates shares for this file
 */
 routes.get("/file/:KEY",asyncHandler(async(req,res,next)=>{
    let filekey = req.params.KEY||'does not exist';
    let s = await Share.getSharesFor({filekey});

    res.send(s);
})); 
/**
 * gets a list of all created shares for this album
 */
 routes.get("/album/:KEY",asyncHandler(async(req,res,next)=>{
    let albumkey = req.params.KEY||'does not exist';

    let s = await Share.getSharesFor({albumkey});

    res.send(s);
})); 

/**
 * removes a given share
 */
routes.delete("/:KEY",asyncHandler(async(req,res,next)=>{
    let key = req.params.KEY||'does not exist';

    let s = await Share.revokeShare(key);

    res.send(s);
}));

module.exports = routes;