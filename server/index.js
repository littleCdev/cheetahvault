const Log = require("./log.js");
const Path = require('path');
const db = require("./db");


const Config = require("./config.json");


const Express = require('express');
const app = Express();

app.use(Express.urlencoded({ extended: true }));

app.set('trust proxy', 1) // trust first proxy
const session = require('express-session')
var FileStore = require('session-file-store')(session);
app.use(session({ 
    store: new FileStore({}),
    secret: 'secrect?', 
    resave:false,
    saveUninitialized:true,
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




/**
 * add routes
 */
app.use("/login/",require("./routes/login"));
app.use("/tags/",require("./routes/tags"));
app.use("/search/",require("./routes/search"));
app.use("/files/",require("./routes/files"));
app.use("/albums/",require("./routes/albums"));
app.use("/upload/",require("./routes/upload"));

/**
 * errorhandler that's called from next(err) inside asyncHandler
 */
app.use(async(err,req,res,next)=>{
    Log.critical(err)
    res.status(500)
    if(typeof err == "string"){
        res.send({message:err})
    }else{
        res.json(err);
    }
});

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