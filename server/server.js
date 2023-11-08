const mysqldump = require('mysqldump');
const cfg = require('./config.json')
const root = GetResourcePath(GetCurrentResourceName());
const prefix = `^9[DATABASE]:^7`
let dumpCount = 0
const convert = (convar) => {
    if (!convar) return false;

    const keyValuePairs = convar.split(';');
    const connectionObject = {};
    keyValuePairs.forEach(pair => {
      const [key, value] = pair.split('=');
      connectionObject[key] = value;
    });

    return (connectionObject)
}

const dump = async (sql_convar) => {
    console.log(`${prefix} ^3starting SQL dump.^7`)
    let start = new Date();
    dumpCount = dumpCount + 1;
    await mysqldump({
        connection: {
            host: cfg?.server || sql_convar?.server  || 'localhost',
            user: cfg?.userid || sql_convar?.userid  || 'root',
            password: cfg?.password || sql_convar?.password || '',
            database: cfg?.database || sql_convar?.database || 'overextended',
        },
        dumpToFile: `${root}/saved/D${start.getDate()}-M${start.getMonth()+1}-H${start.getHours()}-${dumpCount}-db.sql`,
        compressFile: cfg.compressFile || false,
    });
    let stop = new Date();
    console.log(`${prefix} ^3SQL dump finished. Took ${(stop.getTime() - start.getTime())/1000} seconds.^7`)
    if (!cfg?.run_only_once_on_start) console.log(`${prefix} next backup is scheduled in ${cfg?.run_every_x_hours || 12} hours.`)
}

(() => {
    setTimeout(() => {
        console.log(`${prefix} initializing.`)
        const sql_convar = convert(GetConvar('mysql_connection_string'))
    
        if (!sql_convar) console.log(`${prefix} an error occured when getting SQL convar.`)
    
        if (cfg?.run_at_start) {
            dump(sql_convar)
        }
    
        if (!cfg?.run_every_x_hours || cfg?.run_every_x_hours == 0) return;
    
        setInterval(() => {
            dump(sql_convar);
        }, (1000 * 60 * 60) * (cfg?.run_every_x_hours || 12));
    }, 1000);
})();


