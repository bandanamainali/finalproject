const express= require("express");
const app= express();
const cookieParser = require("cookie-parser");
app.use(express.json());
app.use(cookieParser());
//Route imports
const errorMiddleware = require("./middleware/error")
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoutes");
app.use("/api/v1/",product);
app.use("/api/v1",user);
app.use("/api/v1",order);
app.use(errorMiddleware);
module.exports=app;