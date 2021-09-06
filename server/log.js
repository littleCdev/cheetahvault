let colors  = {
    reset:"\x1b[0m",
    red : "\x1b[31m",
    yellow : "\x1b[33m",
    white : "\x1b[37m",
    blue: "\x1b[34m",
}

function _log(color,level,func,msg=null){
    let date = new Date();

    let datestr = date.getFullYear()+"-"+date.getMonth()+"-"+date.getDay()+ " "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+":"+date.getMilliseconds();
    if(msg == null){
        msg = func;
        func = "";
    }
    if(typeof msg != "string"){
        console.log(`${color}${datestr}\t${level}\t${func}\n`);
        console.log(msg);
        console.log(`${colors.reset}`);
    }else{
        console.log(`${color}${datestr}\t${level}\t${func}\t${msg}${colors.reset}`);
    }
}
function debug(func,msg=null){
    _log(colors.blue,"info",func,msg);

}
function info(func,msg=null){
    _log(colors.white,"info",func,msg);
}

function warn(func,msg=null){
    _log(colors.yellow,"warn",func,msg);

}
function critical(func,msg=null){
    _log(colors.red,"critical",func,msg);
}

module.exports = {
    info,
    warn,
    critical
}