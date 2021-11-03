const Sqlite3   = require('sqlite3').verbose();
const util      = require('util');
const Log = require("./log.js");
const fs = require('fs');             // Classic fs
const e = require('express');


let db = null;


let init = async function(){
    try {
        db = await new Sqlite3.Database('./cheetahvault.sqlite', Sqlite3.OPEN_READWRITE | Sqlite3.OPEN_CREATE);
        //db.run = util.promisify(db.run);
        //db.get = util.promisify(db.get);
        db.all = util.promisify(db.all);
    } catch (e) {
        Log("main","failed to connect to sqlite: " + e,true);
        return;
    }
}



/**
 * @typedef {object} sqliterunres
 * @property {number} lastID
 * @property {number} changes
 */

/**
 * 
 * @param {string} query 
 * @param {Array} params 
 * @return {sqliterunres} 
 */
function run(query,params=[]){
    return new Promise((resolve,reject)=>{
        db.run(query,params,function(err){
            if(err){
                reject(err);
            }else{
                resolve(this);
            }
        })
    })
//    return db.run(query,params);
}

/**
 * gets all rows as array
 * @param {*} query 
 * @param {*} params 
 */
function all(query,params=[]){
    return db.all(query,params);
}

/**
 * get a single row from query (first)
 * @param {String} query 
 * @param {Array} params 
 * @returns {object}
 */
function single(query,params=[]){
    return new Promise(async(resolve,reject)=>{
        try{
            let x = await db.all(query,params);
            if(x.length > 0){
                resolve(x[0])
            }else{
                resolve(null);
            }
        }catch(e){
            reject(e);
        }
    })    
}

function get(query,params=[]){
    return db.get(query,params);
}
function prepare(query){
    return db.prepare(query);
}

async function stmRunAsync(stm,params){
    return new Promise((resolve,reject)=>{
        stm.run(params,(err)=>{
            if(err){
                reject(err);    
            }else{
                resolve();
            }
        });
    })
}


module.exports={
    all,
    single,
    run,
    prepare,
    stmRunAsync,
    init
}