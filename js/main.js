(function($) {
  "use strict";

  // On this codelab, you will be streaming only video (video: true).
  const mediaStreamConstraints = {
    audio: false,
    video: true // { facingMode: "user" }
  };

  //
  var servers = {
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
    ]
  };
  var servers = {
    "rtcpMuxPolicy": "require",
    "bundlePolicy": "max-bundle",
    "iceServers": [
      {
        "urls": [
          "stun:64.233.188.127:19302",
          "stun:[2404:6800:4008:c06::7f]:19302"
        ]
      },
      {
        "urls": [
          "turn:74.125.23.127:19305?transport=udp",
          "turn:[2404:6800:4008:c02::7f]:19305?transport=udp",
          "turn:74.125.23.127:19305?transport=tcp",
          "turn:[2404:6800:4008:c02::7f]:19305?transport=tcp"
        ],
        "username": "CIqPvOUFEgaNInq4ZNUYzc/s6OMTIICjBQ",
        "credential": "viMCiIAPoisBHi7/CKsPcMM/E+Q=",
        "maxRateKbps": "8000"
      }
    ],
    "certificates": []
  };

  //
  // let startButton = document.getElementById("startButton");
  // let callButton = document.getElementById("callButton");
  let hangupButton = document.getElementById("hangupButton");
  let getAnswerButton = document.getElementById("getAnswerButton");
  let fetchIceCandidatesButton = document.getElementById("fetchIceCandidatesButton");
  //
  var ROOM_ID_LS_KEY = 'wrtcRoomIdList';

  //
  var $roomBox = $('#room-box');
  // ++++
  var $roomFrm = $('#room-form');
  //
  var $commBox = $('#comm-box');
  //
  var roomId;
  var peerId;

  function ssRoomIdList(rid, opts)
  {
    var roomIdList = sessionStorage.getItem(ROOM_ID_LS_KEY);
    roomIdList = roomIdList ? roomIdList.split(',') : [];
    if (rid) {
      roomIdList.push(rid);
      roomIdList = $.unique(roomIdList);
      localStorage.setItem(ROOM_ID_LS_KEY, roomIdList.join());
    }
    return roomIdList;
  }

  //
  $roomFrm.on('submit', function(event) {
    event.preventDefault();
  });
  // $roomFrm.find('input').val(new Date().getTime());
  $roomFrm.find('#btn-new-room').on('click', function() {
    var rid = new Date().getTime();
    ssRoomIdList(rid);
    location.hash = 'rid=' + rid;
  });
  $roomFrm.find('#btn-join-room').on('click', function() {
    var rid = $.trim($roomFrm.find('input').val());
    var pid = peerId || (new Date().getTime());
    if (rid) {
      ssRoomIdList(rid);
      location.hash = 'rid=' + rid + '&pid=' + pid;
    }
  });
  //.end
  
  function onAppInit()
  {
    roomId = (location.hash.match(/rid=(\d+)/) || [])[1];
    peerId = (location.hash.match(/pid=(\d+)/) || [])[1];

    //
    $roomBox.add($commBox).addClass('hidden');
    // +++
    $commBox.find('.room-label-h span').text(roomId);

    //
    if (!roomId) {
      //
      commDestroy();
      //
      $roomBox.removeClass('hidden');
      var roomIdList = ssRoomIdList();
      //
      var ulHtml = '', pid = peerId || (new Date().getTime());
      $.each(roomIdList, function(idx, roomId) {
        ulHtml += (roomId ? ('<li>'
            + '<a href="#rid=' + roomId + '&pid=' + pid + '">Room: ' + roomId + '</a>'
          + '</li>'
        ) : '');
      });
      ulHtml = ulHtml ? ('<ul class="">' + ulHtml + '</ul>') : '';
      $roomBox.find('#room-list').html(ulHtml);
      //.end
    //
    } else {
      $commBox.removeClass('hidden');
      //
      $.post('', { "cmd": "wrtc_init", "rid": roomId }, null, 'json')
        .done(function() {
          console.log("Comm init done");
        })
        .fail(function(xhr, error) {
          console.error("Comm init fail: ", error);
        });
      //
      commInit();
    }
  }
  $(window).on('hashchange', onAppInit).triggerHandler('hashchange');


/** ------ Communicity Box */
  // Local stream that will be reproduced on the video.
  var iceCandidates = [];
  var localStream;
  var remoteStream;
  var pc1PeerConn;
  var offerOptions = {};
  // Video element where stream will be placed.
  var localVideo = document.getElementById("localVideo");
  var remoteVideo = document.getElementById("remoteVideo");

  /**
   * 
   */
  function commDestroy()
  {
    iceCandidates = [];
    if (pc1PeerConn) {
      pc1PeerConn.close();
      pc1PeerConn = null;
    }
  }

  /**
   * 
   */
  function commInit()
  {
    function getMediaStream(callback) {
      callback = callback || $.noop;
      navigator.mediaDevices
        .getUserMedia(mediaStreamConstraints)
        // Handles success by adding the MediaStream to the video element.
        .then(function(mediaStream) {
          localVideo.srcObject = localStream = mediaStream;
          callback(null, mediaStream);
        })
        // Handles failed
        .catch(function(error) {
          console.log("navigator.getUserMedia error: " + error);
          callback(error, null);
        });
    }

    function fetchIceCandidates(callback) {
      callback = callback || $.noop;
      $.post('', {
        "cmd": "wrtc_getIceCandidates",
        "rid": roomId
      }, null, 'json')
        .done(function(result) {
          var iceCandidates = result.info.iceCandidates;
          console.log("Fetch iceCandidates done: ", iceCandidates);
          if (false === callback(null, iceCandidates)) {
            return;
          }
          (iceCandidates || []).forEach(function(iceCandidate) {
            const newIceCandidate = new RTCIceCandidate(iceCandidate);
            pc1PeerConn
              .addIceCandidate(newIceCandidate)
              .then(() => {
                console.log('addIceCandidate OK');
              })
              .catch(error => {
                console.error('addIceCandidate NG: ', error);
              });
          });
        })
        .fail(function(xhr, error) {
          console.log("Fetch iceCandidates fail: ", error);
          callback(error);
        });
    }
    // Handles remote MediaStream success by adding it as the remoteVideo src.
    function gotRemoteMediaStream(event) {
      console.warn("gotRemoteMediaStream", event);
      const mediaStream = event.stream;
      remoteVideo.srcObject = mediaStream;
      remoteStream = mediaStream;
    }

    //
    function gotRemoteOffer(description) {
      console.log("setRemoteDescription from offer (description): ", description);
      description = ((description instanceof RTCSessionDescription)
        ? description : new RTCSessionDescription(description)
      );
      //
      fetchIceCandidates(function() {
        pc1PeerConn
          .setRemoteDescription(description)
          .then(function() {
            console.log("setRemoteDescription done.");
            //
            getMediaStream(function(error, mediaStream) {
              // pc1PeerConn.addStream(mediaStream);
              pc1PeerConn
                .createAnswer()
                .then(createdAnswer)
                .catch(function(error) {
                  console.error("createAnswer error: " + error);
                });
            });
          })
          .catch(function(error) {
            console.error("setRemoteDescription error: ", error);
          });
      });
    }

    //
    function gotRemoteAnswer(description) {
      // receiving remote description
      console.log("setRemoteDescription from answer (description): ", description);
      //
      pc1PeerConn
        .setRemoteDescription(description)
        .then(() => {
          console.log("setRemoteDescription done.");
          //
          fetchIceCandidates(function(error, iceCandidates) {});
        })
        .catch(error => {
          console.error("setRemoteDescription error: ", error);
        });
    }

    // Logs offer creation and sets peer connection session descriptions.
    function createdOffer(description) {
      console.log("setLocalDescription with offer (description):", description);
      pc1PeerConn
        .setLocalDescription(description)
        .then(function() {
          // sending local description to remote peer
          // ...
          console.log("setLocalDescription done. Sending offer (description) now...", description);
          // sending local description to remote peer
          $.post('', {
            "cmd": "wrtc_createdOffer",
            "rid": roomId,
            "description": description.toJSON()
          }, null, 'json')
            .done(function(result) {
              console.log("Sending offer done: ", result);
            })
            .fail(function(xhr, error) {
              console.error("Sending offer fail: ", error);
            });
        })
        .catch(function(error) {
          console.error("setLocalDescription error: ", error);
        });
    }

    // Logs answer to offer creation and sets peer connection session descriptions.
    function createdAnswer(description) {
      console.log("createAnswer and setLocalDescription with answer (): ", description);
      pc1PeerConn
        .setLocalDescription(description)
        .then(() => {
          console.log("setLocalDescription done. Sending answer (description) now...");
          $.post('', {
            "cmd": "wrtc_createdAnswer",
            "rid": roomId,
            "description": description.toJSON()
          }, null, 'json')
            .done(function(result) {
              console.log("Sending answer done: ", result);
            })
            .fail(function(xhr, error) {
              console.error("Sending answer fail: ", error);
            });
        })
        .catch(error => {
          console.error("setLocalDescription error: ", error);
        });
    }

    // Connects with new peer candidate.
    function handleConnection(event) {
      const peerConnection = event.target;
      const iceCandidate = event.candidate;
      if (iceCandidate) {
        // Get candidate --> sending now...
        $.post('', {
          "cmd": "wrtc_createdIceCandidate",
          "rid": roomId,
          "pid": peerId,
          "iceCandidate": iceCandidate.toJSON(),
        }, null, 'json')
          .done(function(result) {
            console.log("Comm send iceCandidate done: ", result, iceCandidate);
          })
          .fail(function(xhr, error) {
            console.error("Comm send iceCandidate fail: ", error);
          });
        //
        console.log('ICE candidate: ', iceCandidate);
      }
    }
    $(window).on("RTCHandleConnectionPc1", function(event, iceCandidate) {
      iceCandidates.push(iceCandidate);
    });

    //
    function handleConnectionChange(event) {
      console.log("handleConnectionChange: ", event);
    }

    // Initializes local media stream?!
    pc1PeerConn = new RTCPeerConnection(servers);
    pc1PeerConn.addEventListener("icecandidate", handleConnection);
    pc1PeerConn.addEventListener("iceconnectionstatechange", handleConnectionChange);
    pc1PeerConn.addEventListener("addstream", gotRemoteMediaStream);
    // Case: new peer join room
    if (peerId) {
      // Get offer
      $.post('', { "cmd": "wrtc_getOffer", "rid": roomId }, null, 'json')
      .done(function(result) {
        console.log("Comm get offer done: ", result);
        gotRemoteOffer(result.info.description);
      })
      .fail(function(xhr, error) {
        console.error("Comm get offer fail: ", error);
      });
    // Case: create new room
    } else {
      getMediaStream(function(error, mediaStream) {
        console.log("getMediaStream done" + (error ? " with error" : "") + ": ", mediaStream);
        if (mediaStream) {
          pc1PeerConn.addStream(mediaStream);
          pc1PeerConn
            .createOffer(offerOptions)
            .then(createdOffer)
            .catch(function(error) {
              console.error("createOffer error: " + error);
            });
        }
      });
    }
    // Gets the name of a certain peer connection.
    function getPeerName(peerConnection) {
      return "pc1PeerConn";
    }

    getAnswerButton.onclick = function(event) {
      $.post('', {
        "cmd": "wrtc_getAnswer",
        "rid": roomId,
      }, null, 'json')
        .done(function(result) {
          console.log("Get answer done: ", result);
          var description = result.info.description;
          pc1PeerConn
            .setRemoteDescription(description)
            .then(function() {
              fetchIceCandidates();
              console.log("setRemoteDescription done.");
            })
            .catch(function(error) {
              console.error("setRemoteDescription error: ", error);
            });
        })
        .fail(function(xhr, error) {
          console.error("Get answer fail: ", error);
        });
    }

    fetchIceCandidatesButton.onclick = function(event) {
      fetchIceCandidates();
    }
  }
  //.end#commInit
})(jQuery);