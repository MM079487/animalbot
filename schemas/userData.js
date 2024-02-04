const { model, Schema } = require("mongoose");

let userData = new Schema({
  userId: String,
  wallet: { type: Number, default: 0 },
  lastDaily: Date,
})

module.exports = model("userData", userData)