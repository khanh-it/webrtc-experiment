(function($) {
  "use strict";
  //
  // let startButton = document.getElementById("startButton");
  // let callButton = document.getElementById("callButton");
  let hangupButton = document.getElementById("hangupButton");
  let getRemoteVideoButton = document.getElementById("getRemoteVideoButton");
  let getLocalVideoButton = document.getElementById("getLocalVideoButton");
  let fetchIceCandidatesButton = document.getElementById("fetchIceCandidatesButton");

  // Local stream that will be reproduced on the video.
  var localStream;
  var remoteStream;
  var pc1PeerConn;
  var offerOptions = {};
  var iceCandidates = [];
  // Video element where stream will be placed.
  var localVideo = document.getElementById("localVideo");
  var remoteVideo = document.getElementById("remoteVideo");
  //
  let $win = $(window);

  //
  commInit();

  /**
   * 
   *
   */
  function getMediaStream()
  {
    console.log('mediaStreamConstraints: ', mediaStreamConstraints);
    return navigator.mediaDevices
      .getUserMedia(mediaStreamConstraints)
      // Handles success by adding the MediaStream to the video element.
      .then(function(mediaStream) {
        localVideo.srcObject = mediaStream;
        return (localStream = mediaStream);
      })
      // Handles failed
      .catch(function(error) {
        alert("getUserMedia failed: " + error);
      });
  }

  function fetchIceCandidates(callback) {
    callback = callback || $.noop;
    $.post('', {
      "cmd": "wrtc_getIceCandidates",
      "rid": roomId
    }, null, 'json')
      .done(function(result) {
        // iceCandidates = iceCandidates.concat(result.info.iceCandidates || []);
        let iceCandidates = result.info.iceCandidates || [];
        console.log("Fetch iceCandidates done: ", iceCandidates);
        iceCandidates.forEach(function(iceCandidate) {
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
        callback(null, iceCandidates);
      })
      .fail(function(xhr, error) {
        console.log("Fetch iceCandidates fail: ", error);
        callback(error);
      });
  }

  // Handles remote MediaStream success by adding it as the remoteVideo src.
  function gotRemoteMediaStream(event) {
    console.warn("gotRemoteMediaStream", event);
    remoteStream = event.stream;
    remoteVideo.srcObject = remoteStream;
  }

  //
  function gotRemoteOffer(description) {
    console.log("gotRemoteDescription with offer (description): ", description);
    description = ((description instanceof RTCSessionDescription)
      ? description : new RTCSessionDescription(description)
    );
    //
    pc1PeerConn
      .setRemoteDescription(description)
      .then(function() {
        console.log("setRemoteDescription done.");
        //
        fetchIceCandidates(function() {
          getMediaStream().then(function(mediaStream) {
            pc1PeerConn.addStream(mediaStream);
            pc1PeerConn
              .createAnswer()
              .then(createdAnswer)
              .catch(function(error) {
                console.error("createAnswer error: " + error);
              });
          });
        });
      })
      .catch(function(error) {
        console.error("setRemoteDescription error: ", error);
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
    console.log("created answer (description): ", description);
    pc1PeerConn
      .setLocalDescription(description)
      .then(function() {
        console.log("setLocalDescription done. Sending answer (description) now...");
        $.post('', {
          "cmd": "wrtc_createdAnswer",
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
    const iceCandidate = event.candidate;
    if (iceCandidate) {
      iceCandidates.push(iceCandidate.toJSON());
      // Get candidate --> sending now...
      $.post('', {
        "cmd": "wrtc_createdIceCandidate",
        "iceCandidate": iceCandidate.toJSON(),
      }, null, 'json')
        .done(function(result) {
          console.log("Send iceCandidate done: ", result, iceCandidate);
        })
        .fail(function(xhr, error) {
          console.error("Send iceCandidate fail: ", error);
        });
      //
      // console.log('ICE candidate: ', iceCandidate);
    }
  }

  //
  function handleConnectionChange(event) {
    console.warn("handleConnectionChange: ", event);
  }

  /**
   * 
   */
  function commDestroy()
  {
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
    //
    $.post('', {
      "cmd": "wrtc_init",
      "type": "peer",
    }, null, 'json')
      .done(function(result) {
        console.log("Init done");

      })
      .fail(function(xhr, error) {
        console.error("Init fail: ", error);
      });

    // Initializes local media stream?!
    pc1PeerConn = new RTCPeerConnection(servers, offerOptions);
    pc1PeerConn.addEventListener("icecandidate", handleConnection);
    pc1PeerConn.addEventListener("iceconnectionstatechange", handleConnectionChange);
    pc1PeerConn.addEventListener("addstream", gotRemoteMediaStream);
    pc1PeerConn.getStats(function(stats) {
      console.log("getStats: ", stats);
    });
    // Get offer
    $.post('', { "cmd": "wrtc_getOffer" }, null, 'json')
      .done(function(result) {
        console.log("Get offer done: ", result);
        gotRemoteOffer(result.info.description);
      })
      .fail(function(xhr, error) {
        console.error("Get offer fail: ", error);
      });

    getRemoteVideoButton.onclick = function(event) {
      remoteVideo.srcObject = remoteStream;
    }

    getLocalVideoButton.onclick = function(event) {
      remoteVideo.srcObject = localStream;
    }

    fetchIceCandidatesButton.onclick = function(event) {
      fetchIceCandidates();
    }

    hangupButton.onclick = function(event) {
      pc1PeerConn.getStats(function(stats) {
        console.log("getStats: ", stats);
      });
    }
  }
})(jQuery);