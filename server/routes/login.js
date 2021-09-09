const routes = require('express').Router();

const Log = require('../log');
const User = require('../functions/users');




routes.use((req,res,next)=>{
    next();
})

/**
 * returns current userid, http 403 if not logged int, 303 if "setupmode" when no user exists
 */
routes.get("",async (req,res,next)=>{
    if(!req.session.userid){
        if(await User.userCount() > 0){
            res.status(403);
            res.send("not logged in");
        }else{
            res.status(303);
            res.send("please add a user first")
        }
    }else{
        res.json({name:req.session.userid});
    }
})

/**
 * logout, destroys the session
 */
routes.get("/logout",async (req,res,next)=>{
    req.session.destroy();
    res.send();
})


/**
 * tries to login
 * 500
 */
routes.post("",async (req,res,next)=>{
    if(req.session.userid){
        res.status(500);
        res.send("already logged in");
        return;
    }

    let id = await User.login(req.body.username,req.body.password);
    Log.debug(`user logged in with userid: ${id}`);
    if(id > -1){
        req.session.userid = id;
        res.json({name:req.session.userid});
    }else{
        res.status(403);
        res.send("");     
    }
})

/**
 * adds a user if none exists
 * post -> username
 * post -> password
 */
routes.post("/adduser/",async (req,res,next)=>{
    if(req.session.userid){
        Log.info(`adduser forbidden "already logged in"`);
        res.status(500);
        res.send("already logged in");
        return;
    }

    if(await User.userCount() > 0){
        Log.info(`adduser forbidden "there is already a user"`);
        res.status(400);
        res.send("there is already a user");
        return;
    }

    try{
        let user = req.body.username||"";
        let password = req.body.password||"";

        let userid = await User.addUser(user,password);

        res.send(userid);
    }catch(e){
        res.status(500);
        res.send(e);
    }
})



module.exports = routes;