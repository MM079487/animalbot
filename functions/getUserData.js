const userData = require("../schemas/userData")

async function getUserData(userId){
  const data = await userData.findOne({ userId: userId })
    
  if(!data) return false;
  else return data;
}

module.exports = { getUserData }