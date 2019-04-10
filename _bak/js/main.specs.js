"use strict";

// On this codelab, you will be streaming only video (video: true).
const mediaStreamConstraints = {
  audio: false,
  video: true // { facingMode: "user" }
};

//
let servers = {
  /* iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun01.sipphone.com" },
    { urls: "stun:stun.ekiga.net" },
    { urls: "stun:stun.fwdnet.net" },
    { urls: "stun:stun.ideasip.com" },
    { urls: "stun:stun.iptel.org" },
    { urls: "stun:stun.rixtelecom.se" },
    { urls: "stun:stun.schlund.de" },
    { urls: "stun:stunserver.org" },
    { urls: "stun:stun.softjoys.com" },
    { urls: "stun:stun.voiparound.com" },
    { urls: "stun:stun.voipbuster.com" },
    { urls: "stun:stun.voipstunt.com" },
    { urls: "stun:stun.voxgratia.org" },
    { urls: "stun:stun.xten.com" },
    {
      urls: "turn:192.158.29.39:3478?transport=udp",
      credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      username: "28224511:1379330808"
    },
    {
      urls: "turn:192.158.29.39:3478?transport=tcp",
      credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      username: "28224511:1379330808"
    },
    // Use my TURN server on DigitalOcean
    // https://stackoverflow.com/questions/38036552/rtcpeerconnection-onicecandidate-not-fire
    {
      url: "turn:numb.viagenie.ca",
      credential: "sunghiep",
      username: "nghiepnds@yahoo.com"
    }
  ] */
};

//
let RTCSessionDescription = null;

//
let startButton = document.getElementById("startButton");
let callButton = document.getElementById("callButton");
let hangupButton = document.getElementById("hangupButton");
