const { connection } = require("./db");
const express = require("express");
const {userRouter}=require("./routes/user.route")
const app = express();
// const express=require("express")
const winston=require("winston")
const mongooose = require("mongoose");
require("dotenv").config();
expressWinston=require('express-winston')
require("winston-mongodb")
app.use(
  expressWinston.logger({
    transports:[
      new winston.transports.MongoDB({
        level:"error",
        db:mongooose.connect(process.env.url)
      })
    ]
  })
)
app.use(express.json());
app.use("/user",userRouter)
app.listen(process.env.port, async () => {
    try {
      await connection;
      console.log("connected to db");
    } catch (err) {
      console.log(err);
    }
  });
  