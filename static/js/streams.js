const APP_ID = document.getElementById("APP_ID").value;

const CHANNEL = sessionStorage.getItem("room");
const TOKEN = sessionStorage.getItem("token");
let UID = Number(sessionStorage.getItem("UID"));
let NAME = sessionStorage.getItem("name");

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
let localTracks = [];
let remoteUsers = {};

console.log(APP_ID, " ", CHANNEL);
let joinAndDisplayLocalStream = async () => {
  client.on("user-published", handleUserJoin);
  client.on("user-left", handleUserLeft);
  document.getElementById("room-name").innerText = CHANNEL;
  try {
    await client.join(APP_ID, CHANNEL, TOKEN, UID);
  } catch (error) {
    console.log(error);
    window.open("/", "_self");
  }

  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
  let member = await createMember();

  let player = `<div class="video-container" id="user-container-${UID}">
    <div class="username-wrapper"><span id="user-name">${member.name}</span></div>
    <div class="video-player-custom" id="user-${UID}"></div>
  </div>`;

  document
    .getElementById("video-streams")
    .insertAdjacentHTML("beforeend", player);
  localTracks[1].play(`user-${UID}`);

  await client.publish([localTracks[0], localTracks[1]]);
};
let handleUserJoin = async (user, mediaType) => {
  remoteUsers[user.UID] = user;
  await client.subscribe(user, mediaType);
  if (mediaType === "video") {
    let player = document.getElementById(`user-container-${user.uid}`);
    if (player != null) {
      player.remove();
    }
    let member = await get_member(user);

    player = `<div class="video-container" id="user-container-${user.uid}">
        <div class="username-wrapper"><span id="user-name">${member.name}</span></div>
        <div class="video-player-custom" id="user-${user.uid}"></div>
      </div>`;

    document
      .getElementById("video-streams")
      .insertAdjacentHTML("beforeend", player);
    user.videoTrack.play(`user-${user.uid}`);
  }
  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};
let handleUserLeft = async (user) => {
  await deleteMemberRemote(user);
  delete remoteUsers[user.uid];
  document.getElementById(`user-container-${user.uid}`).remove();
};

let leaveAndRemoveLocalStream = async () => {
  for (let i = 0; localTracks.length > i; i++) {
    localTracks[i].stop();
    localTracks[i].close();
  }
  await client.leave();
  await deleteMember();
  window.open("/", "_self");
};

let toggleCamera = async (e) => {
  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    e.target.style.backgroundColor = "#fff";
  } else {
    await localTracks[1].setMuted(true);
    e.target.style.backgroundColor = "rgb(255,80,80,1)";
  }
};

let toggleMic = async (e) => {
  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    e.target.style.backgroundColor = "#fff";
  } else {
    await localTracks[0].setMuted(true);
    e.target.style.backgroundColor = "rgb(255,80,80,1)";
  }
};

let createMember = async () => {
  let response = await fetch("/create_member/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: NAME, room_name: CHANNEL, UID: UID }),
  });
  let member = await response.json();
  return member;
};

let get_member = async (user) => {
  let response = await fetch(
    `/get_member/?UID=${user.uid}&room_name=${CHANNEL}`
  );
  let member = await response.json();
  return member;
};

let deleteMember = async () => {
  let response = await fetch("/delete_member/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: NAME, room_name: CHANNEL, UID: UID }),
  });
  let data = await response.json();
};

let deleteMemberRemote = async (user) => {
  let response = await fetch("/delete_member/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: user.name,
      room_name: CHANNEL,
      UID: user.uid,
    }),
  });
  let data = await response.json();
  console.log(data["response"]);
};

joinAndDisplayLocalStream();

window.addEventListener("beforeunload", async () => {
  await deleteMember();
});

document
  .getElementById("leave-btn")
  .addEventListener("click", leaveAndRemoveLocalStream);

document.getElementById("camera-btn").addEventListener("click", toggleCamera);

document.getElementById("mic-btn").addEventListener("click", toggleMic);

// chat

let openChat = async(e) => {
  console.log(e.target.style.backgroundColor )
  if(e.target.style.backgroundColor === 'rgb(255, 255, 255)')
  {
      e.target.style.backgroundColor =  'rgb(255,80,80,1)'
      document.getElementById('chat-wrapper').style.display = "none"
      document.getElementById('video-wrapper').style.width = '100%'
  }
  else
  {
      e.target.style.backgroundColor = '#fff'
      document.getElementById('chat-wrapper').style.display = "block"
      document.getElementById('chat-wrapper').style.width = "30%"
      document.getElementById('video-wrapper').style.width = '70%'
  }
}

function appendMessage(message) {
  var ul = document.getElementById("chat-box");
  var li = document.createElement("li");
  li.appendChild(document.createTextNode(message));
  ul.appendChild(li);
}

let recognition;
let isRecording = false;
let trans_input = document.getElementById('transcription-text')
let displayText = document.getElementById('displaytext')
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = function(event) {
      const result = event.results[event.results.length - 1];
      const transcription = result[0].transcript;
      trans_input.value = transcription;
  };

  recognition.onerror = function(event) {
      console.error('Speech recognition error:', event.error);
  };

  recognition.onend = function() {
      if (isRecording) {
          recognition.start();
      }
  };
  document.getElementById('record-btn').addEventListener('click',function()
  {
      if (!isRecording) {
          isRecording = true;
          recognition.start();
          document.getElementById('record-btn').style.backgroundColor =  '#fff'

          // Automatically stop recording after 90 seconds
          setTimeout(function() {
              isRecording = false;
              recognition.stop();
              document.getElementById('record-btn').style.backgroundColor = 'rgb(255,80,80,1)'
              
              // Process the transcribed text and send the message
              const message = trans_input.value;

              // Append the message to the display and store it in local storage
              appendMessage(message);
              
              // Clear the transcription area
              trans_input.value = '';
          }, 90000);
      } else {
          isRecording = false;
          recognition.stop();
          document.getElementById('record-btn').style.backgroundColor = 'rgb(255,80,80,1)'
      }
  });

  document.getElementById('send-btn').addEventListener('click',function() {
    document.getElementById('record-btn').style.display = "none"

      // Process the transcribed text and send the message
      const message = trans_input.value;
      console.log("user asked: ",message)
      appendMessage(message);
      const options = {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({text: message}),
        };
        fetch('/llm_response/', options)
        .then(data => {
          if (!data.ok) {
            throw Error(data.status);
          }
          return data.json(); // Return the promise here
        })
        .then(response => {
          console.log(response['response']); // Log the parsed JSON response here
          appendMessage(response['response']);
          isRecording = false;
          recognition.stop();
          document.getElementById('record-btn').style.display = "inline"
          document.getElementById('record-btn').style.backgroundColor = 'rgb(255,80,80,1)'
        })
        .catch(e => {
          console.log('ERROR', e);
        });


      // Clear the transcription area
      trans_input.value = '';
  });
}

document.getElementById('chat-btn').addEventListener('click',openChat)