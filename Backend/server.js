const app = require("./app");
const PORT= 4000;
const cloudinary = require("cloudinary");
const dotenv= require("dotenv");
const connectDatabase = require("./config/database");




connectDatabase();





cloudinary.config({
        cloud_name:process.env.CLOUDINARY_NAME,
        api_key:process.env.CLOUDNARY_API_KEY,
        api_secret:process.env.CLOUDINARY_API_SECRET,
})
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