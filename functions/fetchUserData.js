const userData = require("../schemas/userData")

async function fetchUserData(userId){
    let data = await userData.findOne({ userId: userId })
    
    if(!data){
      data = await new userData({
        userId: userId
      })

    await data.save().then(async data => {
      console.log(`[User Data Created]: UserId: ${userId}`)
    }).catch(console.error)

    return data;
    
  }else return data;
}

module.exports = { fetchUserData }