const Log = require("./log.js");
const fs = require('fs');             // Classic fs
const Path = require('path');
const cheetahFile = require("./file");
const db = require("./db");


const Config = require("./config.json");


const Express = require('express');
const app = Express();

app.use(Express.urlencoded({ extended: true }));

app.set('trust proxy', 1) // trust first proxy
const session = require('express-session')
app.use(session({ 
    secret: 'secrect?', 
    resave:false,
    cookie: {
        sameSite:"none",
        maxAge: 3600000 * 12 ,
        httpOnly: true,
        secure:true,
    }
})) 

const bodyParser = require('body-parser')
app.use(bodyParser.json())


app.use(require("./cors"));


/**
 * serve files from /dist/ directy
 */
app.use(Express.static(Path.join(__dirname, '../frontend/dist/')));





app.use("/login/",require("./routes/login"));
app.use("/tags/",require("./routes/tags"));
app.use("/search/",require("./routes/search"));
app.use("/files/",require("./routes/files"));
app.use("/upload/",require("./routes/upload"));


(async()=>{
    try{
        await db.init();
        await db.createSchema("schema.sql");
        app.listen(Config.webport,Config.bindip,()=>{
            Log.info(`Example app listening at http://${Config.bindip}:${Config.webport}`);
    
        });
    }catch(e){
        Log.critical(e);
    }

})();