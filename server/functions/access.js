async function public(req,res,next){
    next();
}

async function userOnly(req,res,next){
    if(!req.session.userid){
        res.status(403);
        res.send({message:"forbidden"});

        return;
    }

    next();
}

module.exports={
    public,
    userOnly
}