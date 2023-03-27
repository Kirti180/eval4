const jwt = require("jsonwebtoken");
const fs = require("fs");
const redis = require("redis");
const pass = process.env.pass;
const redisClient = redis.createClient({
  url: `redis://default:${pass}@redis-14977.c212.ap-south-1-1.ec2.cloud.redislabs.com:14977`,
});
try {
  redisClient.connect();
} catch (err) {
  console.log(err);
}
const auth = async (req, res, next) => {
  var token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.send({ msg: "bad request" });
  }
  const blacklistdata = JSON.parse(
    fs.readFileSync("./blacklist.json", "utf-8")
  );
    const cach=await redisClient.get(id)
    if (cach){
        res.send({msg:"please login"})
    }
  if (blacklistdata.includes(token)) {
    res.send({ msg: "please login" });
  } else {
    try {
      let decoded = jwt.verify(token, process.env.mainkey);
      if (decoded) {
        req.body.user = decoded.userID;
        req.body.role = decoded.role;
        next();
      } else {
        res.send({ msg: "login again" });
      }
    } catch (err) {
      console.log(err);
    }
  }
};
module.exports = { auth };
