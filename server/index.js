const Log = require("./log.js");
const path = require('path');               // Used for manipulation with path
const fs = require('fs');             // Classic fs
const Path = require('path');

const db = require("./db");


const Config = require("./config.json");


const Express = require('express');
const app = Express();


const bodyParser = require('body-parser')
app.use(bodyParser.json())


const multer  = require('multer')
const upload = multer({ dest: Config.temppath })



const cors = require("./cors");
app.use(cors);


const cheetahFile = require("./file");

app.use(function(req, res, next){
    res.setTimeout(480000, function(){ // 4 minute timeout adjust for larger uploads
        console.log('Request has timed out.');
            res.send(408);
        });

    next();
});


/**
 * serve files from /dist/ directy
 */
 app.use(Express.static(Path.join(__dirname, '../frontend/dist/')));


app.get("/images/:PAGE?",async (req,res,next)=>{

    let page = req.params.PAGE||0;
    let search = req.query.search||"";

    let files = await cheetahFile.getlatest(search,page);

    res.json(files);
})

app.get("/f/*",async (req,res,next)=>{
    let f =  req.path.replace("/f","");
    let x = path.join(__dirname,Config.uploadpath,f);
    console.log(x);

    res.sendFile(x)
})


app.put("/image/:ID/hidden",async(req,res,next)=>{
    try{
        await cheetahFile.makePrivate(req.params.ID,true);
        res.send("ok");
    }catch(e){
        res.status = 500;
        res.send("nok");
    }
})
app.delete("/image/:ID/hidden",async(req,res,next)=>{
    try{
        await cheetahFile.makePrivate(req.params.ID,false);
        res.send("ok");
    }catch(e){
        res.status = 500;
        res.send("nok");
    }
})

app.put("/image/:ID/tags",async(req,res,next)=>{
    try{
        await cheetahFile.setTags(req.params.ID,req.body.tags);
        res.send("ok");
    }catch(e){
        res.status = 500;
        res.send("nok");
    }
})


app.get("/tags",async(req,res,next)=>{
    try{
        let tags = await cheetahFile.getAllTags();

        res.send(tags);
    }catch(e){
        console.log(e);
        res.status = 500;
        res.send(e);
    }
})

app.get("/image/:ID/tags",async(req,res,next)=>{
    try{
        let tags = await cheetahFile.getTags(req.params.ID);
        res.send(tags);
    }catch(e){
        console.log(e);
        res.status = 500;
        res.send("nok");
    }
})

app.post("/upload",upload.single("file"),async function(req,res,next){
    try{
        await cheetahFile.newFile(req.file.originalname,req.file.path,req.body.date)
        res.send(newimage);

    }catch(e){
        res.status=500;
        res.send(e);
    }
});


(async()=>{
    await db.init();
    await db.createSchema("schema.sql");
    app.listen(Config.webport,Config.bindip,()=>{
        Log.info(`Example app listening at http://${Config.bindip}:${Config.webport}`);

    });
})();