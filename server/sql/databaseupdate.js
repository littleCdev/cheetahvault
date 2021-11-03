const db    = require("../db");
const Log   = require("../log.js");
const fs    = require('fs');             // Classic fs
const NeededDatabseVersion = require("./version.json").databaseversion;

/**
 * returns current version, -1 if no version found (probably no db)
 * @returns {Number}
 */
async function getCurrentVersion(){
    let res = null;

    try{
        // check if table exists first
        res = await db.single("SELECT name FROM sqlite_master WHERE type='table' and name='conf'");
        if(res == null)
            return -1;

        res = await db.single("select currentversion from conf");
    }catch(e){
        Log.critical(e);
        return;
    }

    if(res == null){
        return -1;
    }

    return res.currentversion;
}


let init = async function(){

    let currentVersion = await getCurrentVersion();
    Log.info(`current database version: ${currentVersion}`);
    Log.info(`required database version: ${NeededDatabseVersion}`);

    if(currentVersion == -1){
        Log.info("No database found, initing database");
        await createSchema("./sql/schema.sql");
        Log.info(`createSchema done`);
        let currentVersion = await getCurrentVersion();
        Log.info(`current database version: ${currentVersion}`);
    }

    if(currentVersion === NeededDatabseVersion){
        Log.info(`no databaseupdate needed`);

        return;
    }

    while(currentVersion < NeededDatabseVersion){
        let nextVersion = currentVersion+1;
        let updatefile = `./sql/updates/${currentVersion}-to-${nextVersion}.sql`;
        
        let schema = fs.readFileSync(updatefile)+"";
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
            Log.critical("sqlite: update failed " + e);
            return;
        }

        currentVersion = await getCurrentVersion();
        Log.info(`done running ${updatefile}`);
        Log.info(`new databaseversion is : ${currentVersion}`);
    }
    Log.info(`sqlupdate done`);
}

let createSchema = async function(filename){
    let schema = fs.readFileSync(filename) +"";
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


module.exports = {
    init
}