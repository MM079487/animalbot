// const userData = require("../../schemas/userData")
// const { fetchUserData } = require("../../functions/fetchUserData")

// module.exports = {
//   name:"messageCreate",
//   async execute(message, client){
//     if(message.author.bot) return;

//     const randomNumber = Math.floor(Math.random() * (5 - 1 + 1) + 1)
//     const data = await fetchUserData(message.author.id)

//     await userData.findOneAndUpdate(
//       { userId: data.userId },
//       { wallet: data.wallet + randomNumber }
//     )

//   }
// }