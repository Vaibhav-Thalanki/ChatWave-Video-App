document.addEventListener("DOMContentLoaded", function (event) {
  const APP_ID = document.getElementById("APP_ID").value;
  console.log(APP_ID);
  const CHANNEL = "mychannel";
  const TOKEN =
    "00603a3bcc67ca94c90977ec0e52e4f578dIAA+GfffjzUef5g3bHCE6+rSrkD+u7+A4qG87nCFTJ/Wud+pr8cI9AikIgD3BgUFgVwBZgQAAQCBXAFmAgCBXAFmAwCBXAFmBACBXAFm";
  let UID = 117;

  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  let localTracks = [];
  let remoteUsers = {};

  let joinAndDisplayLocalStream = async () => {
    await client.join(APP_ID, CHANNEL, TOKEN, UID);
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
    client.on("user-published", handleUserJoin);
    client.on("user-left", handleUserLeft);
    let player = `<div class="video-container" id="user-container-${UID}">
    <div class="username-wrapper"><span id="user-name">My Name</span></div>
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
      player = `<div class="video-container" id="user-container-${user.uid}">
        <div class="username-wrapper"><span id="user-name">My Name</span></div>
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

  joinAndDisplayLocalStream();

  document
    .getElementById("leave-btn")
    .addEventListener("click", leaveAndRemoveLocalStream);

  document.getElementById("camera-btn").addEventListener("click", toggleCamera);

  document.getElementById("mic-btn").addEventListener("click", toggleMic);
});
