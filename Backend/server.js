const app = require("./app");
const PORT= 4000;

const dotenv= require("dotenv");
const connectDatabase = require("./config/database");


// config
dotenv.config({path:"Backend/config/config.env"});

connectDatabase();
// making a server
const server =app.listen(process.env.PORT,()=>{
   
        console.log(`server is working at http://localhost:${process.env.PORT}`);
    
    
 

});

//unhandled Promise Rejection

process.on("unhandledREjection",err=>{
        console.log(`Error: ${err.message}`);
        console.log(`shutting down the server due to unhandled promise Rejection`);
        server.close(()=>{
                process.exit(1);
        });

});