module.exports = {
  name:"messageCreate",
  async execute(message, client){
    if(message.author.bot) return;
  // if (message.guild.id == 979612810797543504) return
  const args = message.content.trim().split(/ +/g);

  if(message.channel.id == "1330166283278487635"){
    if(message.content.startsWith("a+")){
      if(args[0] == " ") return true

      fs.readFile('list.json', function (err, data) {
        var json = JSON.parse(data)
        json.push(args.join(" ").slice(2))
    
        fs.writeFileSync("list.json", JSON.stringify(json))
        let desc = ""

        json.forEach((item, index) => {
          desc += `${index+1}. ${item}\n`
        });



        const embed = new EmbedBuilder()
        .setTitle("TOUR LIST")
        .setDescription(`${desc}`)
        .setColor("Green")

        message.reply({ embeds: [embed] })
      })
    }else if(message.content.startsWith("a-")){
      if(args[0] == " ") return true

      fs.readFile('list.json', function (err, data) {
        var json = JSON.parse(data)
        let target = json.indexOf(args.join(" ").slice(2))
        if(target !== -1){
          json.splice(target, 1)
        }else{
          return message.reply("No member found!")
        }
    
        fs.writeFileSync("list.json", JSON.stringify(json))

        let desc = ""

        json.forEach((item, index) => {
          desc += `${index+1}. ${item}\n`
        });



        const embed = new EmbedBuilder()
        .setTitle("KL TOUR LIST")
        .setDescription(`${desc}`)
        .setColor("Red")

        message.reply({ embeds: [embed] })

      })
    }else if(message.content.startsWith("a*")){
      fs.readFile('list.json', function (err, data) {
        var json = JSON.parse(data)
        let desc = ""

        json.forEach((item, index) => {
          desc += `${index+1}. ${item}\n`
        });



        const embed = new EmbedBuilder()
        .setTitle("KL TOUR LIST")
        .setDescription(`${desc}`)
        .setColor("Green")

        message.reply({ embeds: [embed] })
    })
    }
  }

  ban_list = ["爸爸", "sb", "SB", "父亲", "义父", "父", "爹", "爷", "祖父"]
  if (message.author.bot) return

  if(message.content.includes("念") && message.content.includes("讲")) return;
  if(message.content.includes("念") || message.content.includes("讲")){
    if (client.cooldowns.has(message.author.id)) {
      // cooldown not ended
      return;
    }else{
      if(message.content.startsWith("讲")){
        if(args.some(r=> ban_list.includes(r))) return
        message.reply(args.join(" ").slice(1))
      }else if(message.content.includes("念")){
        let str = args.join(" ")
        const before = str.substring(0, str.indexOf('念'));
        const after = str.substring(str.indexOf('念')+1);
        
        message.reply(`${before}: ${after}`)
      }

      client.cooldowns.set(message.author.id, true);

      // After the time you specified, remove the cooldown
      setTimeout(() => {
        client.cooldowns.delete(message.author.id);
      }, client.COOLDOWN_SECONDS * 1000);
    }
  }
  // if (message.author.id == "724335188271955979") return

  mad_list = ["SB", "显眼包", "小丑", "老弟", "懂哥", "傻逼", "sb", "懂哥", "qnmd", "QNMD", "sm", "SM", "lupsup", "靠北什么", "柠檬", "NM", "nm", "艹", "屌你", "虾头", "出生", "cnm", "jibai", "niama", "pukima", "bunde", "蠢驴", "土鸡", "傻鸟", "傻春", "你妈", "吉吉国王", "dllm", "mad", "clown", "嗯", "弱智", "jb", "飞舞", "脑瘫", "脑残", "低能儿", "喜憨儿", "神经病", "废物", "乐色", "垃圾", "可悲", "低能", "死妈", "司马", "没有墓秦", "眉目", "没母", "畜生", "神金病", "傻", "蠢材", "蠢蛋", "屁股长毛", "md", "knn", "gnn", "我是你爹", "沙比", "消愁", "没话讲了", "可剥", "重开拉", "嫩爹", "我，你爹", "我,你爹", "我, 你爹", "草泥马"]
  if (message.content.includes("https://")) {
    return true
  }

  for (var i = 0; i < mad_list.length; i++) {
    if (message.content.includes(mad_list[i].toLowerCase())) {
      // Function to fetch the content of the text file
      async function fetchInsults() {
        try {
          const response = await fetch('https://raw.githubusercontent.com/pokemonchw/Dirty/master/Insult.txt');

          if (!response.ok) {
            throw new Error('Failed to fetch insults');
          }

          const text = await response.text();
          return text.split('\n'); // Split the text into an array of lines
        } catch (error) {
          console.error('Error fetching insults:', error.message);
          return [];
        }
      }

      // Function to pick a random line from an array
      function getRandomLine(lines) {
        const randomIndex = Math.floor(Math.random() * lines.length);
        return lines[randomIndex];
      }

      // Example usage
      async function getRandomInsult() {
        const lines = await fetchInsults();

        if (lines.length > 0) {
          const randomInsult = getRandomLine(lines);
          message.reply(randomInsult);
        } else {
          console.log('No insults available.');
        }
      }

      // Call the function to get a random insult
      // getRandomInsult()
      break;
    }
  }

  // if(message.content.includes("讲好来")){
  //   message.reply("好来")
  // }

  }
}