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
  delete remoteUsers[user.uid];
  document.getElementById(`user-container-${user.uid}`).remove();
};

let leaveAndRemoveLocalStream = async () => {
  for (let i = 0; localTracks.length > i; i++) {
    localTracks[i].stop();
    localTracks[i].close();
  }
  await client.leave();
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

let get_member = async(user)=>{
    let response = await fetch(`/get_member/?UID=${user.uid}&room_name=${CHANNEL}`,)
    let member = await response.json()
    return member
}

joinAndDisplayLocalStream();

document
  .getElementById("leave-btn")
  .addEventListener("click", leaveAndRemoveLocalStream);

document.getElementById("camera-btn").addEventListener("click", toggleCamera);

document.getElementById("mic-btn").addEventListener("click", toggleMic);
