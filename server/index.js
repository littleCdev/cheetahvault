const Log = require("./log.js");
const Path = require('path');
const db = require("./db");
const dbupdate = require("./sql/databaseupdate").init;

const Config = require("./config.json");


const Express = require('express');
const app = Express();

app.use(Express.urlencoded({ extended: true }));

app.set('trust proxy', 1) // trust first proxy
const session = require('express-session')
var FileStore = require('session-file-store')(session);

let sessionConfig = { 
    store: new FileStore({}),
    secret: 'secrect?', 
    resave:false,
    saveUninitialized:true,
    cookie: {
        sameSite:"none",
        maxAge: 1000*60*60*24*31 , // one month
        httpOnly: true,
        secure:true,
    }
};
// check for production/debug
if (app.get('env') === 'production') {
    sessionConfig.cookie.secure = false;
    sessionConfig.cookie.sameSite = "strict";
}
  
app.use(session(sessionConfig)); 

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
app.use("/share/",require("./routes/share"));
app.use("/public/",require("./routes/public"));

/**
 * errorhandler that's called from next(err) inside asyncHandler
 */
app.use(async(err,req,res,next)=>{
    Log.critical(err)
    res.status(500)
    if(typeof err == "string"){
        res.send({message:err})
    }else{
        res.send(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
});

(async()=>{
    try{
        await db.init();
        await dbupdate();
        app.listen(Config.webport,Config.bindip,()=>{
            Log.info(`Example app listening at http://${Config.bindip}:${Config.webport}`);
    
        });
    }catch(e){
        Log.critical(e);
    }

})();