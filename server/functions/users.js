const Config = require("../config.json");
const db = require("../db");
const Log = require("../log");
const bcrypt = require('bcrypt');

const SALTROUNDS = 10;
/**
 * save usercount to save some queries later on
 */
 let usercount = 0;

/**
 * 
 * @param {string} username 
 * @param {string} password 
 * @returns {Integer} userid, -1 if failed
 */
async function login(username,password){
    let res = await db.all("select * from users where username=?",[username]);

    if(res.length != 1){
        Log.warn("invalid username or password, no entry found in DB")

        return -1;
    }
    
    if(bcrypt.compareSync(password, res[0].password)){
        return res[0].id;
    }else{
        return -1;
    }
}

/**
 * 
 * @param {string} username 
 * @param {string} password 
 * @returns userid
 */
async function addUser(username,password){
    let res = await db.all("select id from users where username=?",[username]);
    if(res.length > 0)
        throw "Username is taken";

    let hash = await bcrypt.hash(password,SALTROUNDS);


    res = db.run("insert into users (username,password) values (?,?)",[username,hash]);
    Log.info(`added user ${username} with id: ${res.lastId}`);
    return res.lastId;
}

/**
 * 
 * @returns {integer} count of users in the database
 */
async function userCount(){

    if(this.usercount > 0)
        return this.usercount;
    
    let res = await db.all("select count(id) as cnt from users");
    if(res.length == 0)
        return 0;

    this.usercount = res[0].cnt;

    return this.usercount;
}

module.exports = {
    userCount,
    login,
    addUser
}