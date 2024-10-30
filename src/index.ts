import dbConnection from "./config/dbConfig"
import server from "./server";

(async() => {
    try{
        server;
        await dbConnection();
    }catch(error){
        console.error((error as Error)?.message || "error occured")
        process.exit(1);
    }
})();