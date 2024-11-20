//---------------------------------------------Imports from packages
const express = require('express');
const bodyparser = require("body-parser");
const mongoose = require('mongoose');
const cors = require("cors");


//---------------------------------------------Imports from other files
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const productRouter = require("./routes/product");
const userRouter = require("./routes/user");

//---------------------------------------------PORT and DB
const PORT = process.env.PORT || 3000;
const DB = 'mongodb+srv://hassan:rootishassan@cluster0.sc6nk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const app =express();


app.use(cors());
app.use(bodyparser.urlencoded({extended:false}));
//here we test json request and response so add json or user json
app.use(express.json());


//---------------------------------------------Middlewares
app.use(authRouter);
app.use(adminRouter);
app.use(productRouter);
app.use(userRouter);

//sample 
// app.use('/user',userRouter);


//---------------------------------------------DB Connection
// .then is used since its a promise/future, we can use await but since we are not in a function so .then is used
mongoose.connect(DB).then(() => {
    console.log("DB connection successfull");
}).catch((e) => {
console.log(e);
});

//---------------------------------------------Server Connection
app.listen(PORT, '0.0.0.0',() => {console.log('server is running on port' + PORT)});

