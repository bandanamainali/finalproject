const express= require("express");
const app= express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

//config 
dotenv.config({path:"Backend/config/config.env"});

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());
//Route imports
const errorMiddleware = require("./middleware/error")
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoutes");
const paymentRoute = require('./routes/payment');

app.use("/api/v1/",product);
app.use("/api/v1",user);
app.use("/api/v1",order);
app.use('/api', paymentRoute);
// middleware for Errors
app.use(errorMiddleware);
module.exports=app;