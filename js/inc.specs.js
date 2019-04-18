"use strict";

// On this codelab, you will be streaming only video (video: true).
const mediaStreamConstraints = {
  audio: false,
  video: {
    // facingMode: "user"
    width: 240,
    height: 320
  }
};

// https://gist.github.com/sagivo/3a4b2f2c7ac6e1b5267c2f1f59ac6c6b
var servers = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
      ]
    }
  ]
};
var servers111 = {
  rtcpMuxPolicy: "require",
  bundlePolicy: "max-bundle",
  iceServers: [
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
  ],
  certificates: []
};
var servers = {
  rtcpMuxPolicy: "require",
  bundlePolicy: "max-bundle",
  iceServers: [
    {
      urls: ["stun:64.233.188.127:19302", "stun:[2404:6800:4008:c06::7f]:19302"]
    },
    {
      urls: [
        "turn:74.125.23.127:19305?transport=udp",
        "turn:[2404:6800:4008:c02::7f]:19305?transport=udp",
        "turn:74.125.23.127:19305?transport=tcp",
        "turn:[2404:6800:4008:c02::7f]:19305?transport=tcp"
      ],
      username: "CIqPvOUFEgaNInq4ZNUYzc/s6OMTIICjBQ",
      credential: "viMCiIAPoisBHi7/CKsPcMM/E+Q=",
      maxRateKbps: "8000"
    }
  ],
  certificates: []
};

//
var ROOM_ID_LS_KEY = "wrtcRoomIdList";
//
var roomId = _PDAT.roomId;
var peerId = _PDAT.peerId;

function ssRoomIdList(rid, opts) {
  var roomIdList = sessionStorage.getItem(ROOM_ID_LS_KEY);
  roomIdList = roomIdList ? roomIdList.split(",") : [];
  if (rid) {
    roomIdList.push(rid);
    roomIdList = $.unique(roomIdList);
    localStorage.setItem(ROOM_ID_LS_KEY, roomIdList.join());
  }
  return roomIdList;
}

/**
 *
 */
(function($) {
  /**
   * Xhr pool 4 events
   */
  function xhrPool()
  {
    $.get("", { cmd: "wrtc_getEvents" }, null, "json")
      .done(function(result) {

      })
      .fail(function(xhr, error) {
        console.log("Fetch events fail: ", error);
      });
  }
  setInterval(xhrPool, 5000);
})(jQuery);
