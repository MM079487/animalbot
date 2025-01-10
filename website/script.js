let clientData = false
let guildId;
// const passwordInput = document.querySelector("#password")
const logArea = document.querySelector(".logArea")
const guildBox = document.querySelector(".guildBox")
var recordBox = document.getElementsByClassName("recordBox")
const guildSelectionPanel = document.querySelector(".guildSelectionPanel")
const webBody = document.querySelector(".webBody")
// const loginPanel = document.querySelector(".loginPanel")

fetch('./data.json')
  .then((response) => response.json()) //first time data
  .then((json) => {
    clientData = json
    for (let i = 0; i < Object.keys(clientData).length; i++) {
      let currentIndex = clientData[Object.keys(clientData)[i]]
      if (currentIndex.attachment) {
        createAttachmentLogBox(currentIndex)
      } else {
        createLogBox(currentIndex)
      }
    }
    window.scrollTo(0, document.body.scrollHeight); //scroll to bottom
  });


var interval = setInterval(function() {
  fetch('./data.json')
    .then((response) => response.json())
    .then((json) => {
      if (!_.isEqual(clientData, json)) { //different with first time data (data updated)
        clientData = json
        let lastElement = clientData[Object.keys(clientData)[Object.keys(clientData).length - 1]]
        if (lastElement.attachment) {
          createAttachmentLogBox(lastElement)
          console.log("added attachment box")
        } else {
          createLogBox(lastElement)
          console.log("added box")
        }
        window.scrollTo(0, document.body.scrollHeight);
      }
    });
}, 500);

function get_url_extension( url ) {
    let fileType = url.split(/[#?]/)[0].split('.').pop().trim()
  if(fileType == "png" || fileType == "jpg") return "[Image]"
  else if(fileType == "ogg" || fileType == "mp3") return "[Audio]"
  else return "[Unknow]"
}

function showHtmlTag(text){
  let result1 = ""
  let result2 = ""
  let result3 = ""
  let result4 = ""
  result1 = text.replace(/<br>/g, "")
  result2 = result1.replace(/</g, "&lt;")
  result3 = result2.replace(/>/g, "&gt;")
  result4 = result3.replace(/\n/g, "<br>")

  return result4
}

function createAttachmentLogBox(data) {
  const box = `
  <div class="attachmentLogBox recordBox" title="${data.guildName ? data.guildName : ""}"  name="${data.guildIcon ? data.guildIcon : ""}">
    <div class="authorPfp">
        <img id="authorPfpImg" src="${data.authorIcon}" style="border-radius: 50%;width: 40px;">
        <div class="authorName">${data.name}</div>
    </div>
    <div class="message">${showHtmlTag(data.message)}</div>
    <div class="attachment">${Array.isArray(data.attachment) ? data.attachment.map(v => "<a class=\"attachmentText\" href=\"" + v + "\" target=\"_blank\">" + get_url_extension(v) + "</a>") : "<a class=\"attachmentText\" href=\"" + data.attachment + "\" target=\"_blank\">" + get_url_extension(data.attachment) + "</a>"}</div>
    <div class="footer">${convertTime(data.time)} ${data.channel ? " - " + data.channel : " "}</div>
  </div>
  `

  logArea.innerHTML += box
}

function createLogBox(data) {
  const box = `
  <div class="logBox recordBox" title="${data.guildName ? data.guildName : ""}" name="${data.guildIcon ? data.guildIcon : ""}">
      <div class="authorPfp">
          <img id="authorPfpImg" src="${data.authorIcon}" style="border-radius: 50%;width: 40px;">
          <div class="authorName">${data.name}</div>
      </div>
      <div class="message">${showHtmlTag(data.message)}</div>
      <div class="footer">${convertTime(data.time)} ${data.channel ? " - " + data.channel : " "}</div>
  </div>
  `

  logArea.innerHTML += box
}

function convertTime(timeStamp) {
  var date = new Date(timeStamp);
  var timeStampNow = new Date()
  let showDate;

  if ((timeStampNow.getDate() - date.getDate()) > 1) { //more than 2 days
    showDate = date.toLocaleDateString("default")
  } else if ((timeStampNow.getDate() - date.getDate()) == 1) { //yesterday
    showDate = "Yesterday"
  } else { //today
    showDate = "Today"
  }

  return `${showDate} | ${date.toLocaleTimeString("en-US")}`
}

function guildSelection() {

  //style settings
  webBody.style.filter = "blur(30px)";

  //adding guild boxes
  let guildArray = [];

  setTimeout(() => {
    for (let i = 0; i < recordBox.length; i++) {
      if (!guildArray.filter(e => e.guildName == recordBox[i].title).length > 0 && recordBox[i].title != "") {
        guildArray.push({
          guildName: recordBox[i].title,
          guildIcon: recordBox[i].getAttribute("name")
        })
      }
    }

    var selections = document.querySelector(".selections")

    for (let i = 0; i < guildArray.length; i++) {
      const guildBox = `
      <div class="guildBox">
        <div class="guildImg">
        <img src="${guildArray[i].guildIcon}" alt="Img">
        </div>
        <div class="guildName">${guildArray[i].guildName}</div>
      </div>
      `

      selections.innerHTML += guildBox
    }




  const guildBoxClass = document.getElementsByClassName("guildBox")
  for (var i = 0; i < guildBoxClass.length; i++) {
    guildBoxClass[i].onclick = function(box) {
      const guildBoxClicked = box.srcElement.innerText || box.srcElement.childNodes[3].innerText
      guildSelectionPanel.style.display = "none";
      webBody.style.filter = "blur(0px)";
  
      for (let i = 0; i < recordBox.length; i++) {
        recordBox[i].style.display = "none";
      }
  
      
      for (let i = 0; i < recordBox.length; i++) {
        if(recordBox[i].getAttribute("title") == guildBoxClicked){
          recordBox[i].style.display = "block";
        }
      }
    }
  }
  }, 500);
}

// hide this temporary as we only have 1 guild now
// guildSelection()

function closeWindow(){
  guildSelectionPanel.style.display = "none";
  webBody.style.filter = "blur(0px)";
}

function callGuildPanel(){
  guildSelectionPanel.style.display = "block";
  webBody.style.filter = "blur(30px)";
}

// function submitPassword(){
//   if (passwordInput.value != "yryisgay") {
//     window.location.replace("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
//     return console.log("password Wrong")
//   }

//   loginPanel.style.display = "none"
//   logArea.style.filter = "blur(0px)"
// }