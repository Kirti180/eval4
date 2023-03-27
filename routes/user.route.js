const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fs = require("fs");
const { auth } = require("../middleware/auth");
const bcrypt = require("bcrypt");
const express = require("express");
const rateLimit = require('express-rate-limit')
const { userModel } = require("../models/user");
const userRouter = express.Router();
const redis = require("redis");
const pass = process.env.pass;
const http=require("http")
const redisClient = redis.createClient({
  url: `redis://default:${pass}@redis-14977.c212.ap-south-1-1.ec2.cloud.redislabs.com:14977`,
});
try {
  redisClient.connect();
} catch (err) {
  console.log(err);
}
userRouter.use(express.json());

// REGISTER ROUTE
userRouter.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const user = await userModel.find({ email });
    {
      bcrypt.hash(password, 5, async (err, hash) => {
        if (err) {
          res.send({ msg: "something went wrong" });
        } else {
          const user = new userModel({ name, email, role, password: hash });
          await user.save();
          res.send({ msg: "new user registered" });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// LOGIN ROUTER
userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.find({ email });
    if (user.length > 0) {
      bcrypt.compare(password, user[0].password, (err, result) => {
        if (result) {
          let maintoken = jwt.sign(
            { userID: user[0]._id },
            process.env.mainkey
          );
          let reftoken = jwt.sign({ userID: user[0]._id }, process.env.refkey);
          res.send({
            msg: "logedin",
            maintoken: maintoken,
            reftoken: reftoken,
          });
        } else {
          res.send({ msg: "wrong credentials" });
        }
      });
    } else {
      res.send({ msg: "wrong credentials" });
    }
  } catch (err) {
    console.log(err);
  }
});

// logout route
userRouter.get("/logout", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const blacklistdata = JSON.parse(
    fs.readFileSync("./blacklist.json", "utf-8")
  );
  blacklistdata.push(token);
  fs.writeFileSync("./blacklist.json", JSON.stringify(blacklistdata));

  await redisClient.set(id, JSON.stringify(token));
  res.send({ msg: "user loged out" });
});
//timer
const apiLimiter = rateLimit({
	windowMs: 3 * 60 * 1000, // 15 minutes
	max: 1, // Limit each IP to 1 requests per `window` (here, per 1 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
//weather api
userRouter.post("/weather",auth,apiLimiter,async (req, res) => {
  const cach = await redisClient.get(id);
  if (cach) {
    res.send(cach);
  } else {
    const api = process.env.apikey;
    const  city= req.query.city;
    let weather = await fetch(
      `http://api.weatherstack.com/current/${api}?query=${city}`
    ).then((res) => res.json());
    weather = JSON.stringify(weather);
    await redisClient.set(id, weather,'EX',1800);
    res.send({ msg: weather });
  }
});


userRouter.post("/", (req, res) => {
    const query = req.body.cityName
    const apiKey = "3001a3797f8583f79e8b08076cc33e47"
    const url = 'https://api.openweathermap.org/data/2.5/weather?q=' + query + '&appid=' + apiKey

    https.get(url, (response) => {
        // console.log(response.statusCode)
        response.on("data", (data) => {
            const weatherData = JSON.parse(data);
            console.log(weatherData)
            const temp = weatherData.main.temp;
            const discription = weatherData.weather[0].description
            // console.log(discription)
            res.send(`The temperature in ${query} is ${temp} degree celcius \n And weather desciption are ${discription}`)
        })
    })
    // console.log(req.body.cityName)
})

module.exports = { userRouter };
