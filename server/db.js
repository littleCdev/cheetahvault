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


let createSchema = async function(filename){
    let schema = fs.readFileSync(filename) + "";
    //remove \n
    schema = schema.replace(/(\r\n|\n|\r)/gm, "");

    let tableSchemas = schema.split(";");
    try {
        for (let i = 0; i < tableSchemas.length; i++) {
            if (tableSchemas[i].length === 0)
                continue;
            Log.info("sqlite: running: " + tableSchemas[i]);
            await db.run(tableSchemas[i]);
            Log.info("sqlite done");
        }
    } catch (e) {
        Log.critical("sqlite: failed to create db: " + e);
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
    run,
    prepare,
    stmRunAsync,
    init,
    createSchema
}