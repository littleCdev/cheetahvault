const routes = require('express').Router();

const Log = require('../log');
const cheetahFile = require("../file");



routes.use(require("../functions/access").userOnly);

/**
 * /search/:PAGE?search=xxx
 * returns images filtered by ?search=
 */
routes.get("/:PAGE",async (req,res,next)=>{

    let page = req.params.PAGE||0;
    let search = req.query.search||"";
    Log.debug(`page: ${page} query: ${search}`);
    let files = await cheetahFile.getlatest(search,page);

    res.json(files);
})

module.exports = routes;