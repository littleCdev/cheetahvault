
module.exports=(req,res,next)=>{
    let origin = req.get('origin');
    
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", origin||"*");
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    //intercepts OPTIONS method
    if ('OPTIONS' === req.method) {
        //respond with 200
        res.status(200);
        res.send();
    }
    else {
        //move on
        next();
    }
}