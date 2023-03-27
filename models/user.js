const mongoose = require("mongoose");
userSchema = mongoose.Schema({
id:{
    type:String,
    require:true
},
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  
});
userModel = mongoose.model("users", userSchema);
module.exports = { userModel };
