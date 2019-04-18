(function($) {
  "use strict";

  //
  // let startButton = document.getElementById("startButton");
  // let callButton = document.getElementById("callButton");
  let hangupButton = document.getElementById("hangupButton");
  let getAnswerButton = document.getElementById("getAnswerButton");
  let fetchIceCandidatesButton = document.getElementById("fetchIceCandidatesButton");
  //
  let $win = $(window);

  //
  commInit();

  // Local stream that will be reproduced on the video.
  var localStream;
  var remoteStream;
  var pc1PeerConn;
  var offerOptions = {};
  var iceCandidates = [];
  // Video element where stream will be placed.
  var localVideo = document.getElementById("localVideo");
  var remoteVideo = document.getElementById("remoteVideo");

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

  /**
   * Handles remote MediaStream success by adding it as the remoteVideo src.
   * @param {*} event 
   */
  function gotRemoteMediaStream(event)
  {
    console.warn("gotRemoteMediaStream", event);
    remoteStream = event.stream;
    remoteVideo.srcObject = remoteStream;
  }

  // Connects with new peer candidate.
  function handleConnection(event) {
    const iceCandidate = event.candidate;
    if (iceCandidate) {
      iceCandidates.push(iceCandidate.toJSON());
      // Get candidate --> sending now...
      $.post('', {
        "cmd": "wrtc_createdIceCandidate",
        "iceCandidate": iceCandidate.toJSON()
      }, null, 'json')
        .done(function(result) {
          console.log("Send iceCandidate done: ", iceCandidate);
        })
        .fail(function(xhr, error) {
          console.error("Send iceCandidate fail: ", error);
        });
    }
  }

  //
  function handleConnectionChange(event) {
    console.warn("handleConnectionChange: ", event);
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
      "type": "client",
    }, null, 'json')
      .done(function(result) {
        console.log("Init done");

      })
      .fail(function(xhr, error) {
        console.error("Init fail: ", error);
      });

    //
    function gotRemoteAnswer(description) {
      // receiving remote description
      console.log("gotRemoteAnswer (description): ", description);
      //
      // fetchIceCandidates(function(error, iceCandidates) {
        pc1PeerConn
          .setRemoteDescription(description)
          .then(function() {
            console.log("setRemoteDescription done.");
            fetchIceCandidates(function(error, iceCandidates) {
              remoteVideo.srcObject = remoteStream;
            });
          })
          .catch(error => {
            console.error("setRemoteDescription error: ", error);
          });
      // });
    }

    // Initializes local media stream?!
    getMediaStream().then(function(mediaStream) {
      pc1PeerConn = new RTCPeerConnection(servers, offerOptions);
      pc1PeerConn.addEventListener("icecandidate", handleConnection);
      pc1PeerConn.addEventListener("iceconnectionstatechange", handleConnectionChange);
      pc1PeerConn.addEventListener("addstream", gotRemoteMediaStream);
      pc1PeerConn.addStream(mediaStream);
      pc1PeerConn
        .createOffer(offerOptions)
        .then(createdOffer)
        .catch(function(error) {
          console.error("createOffer error: " + error);
        });
    });

    getAnswerButton.onclick = function(event) {
      $.post('', {
        "cmd": "wrtc_getAnswer",
        "rid": roomId,
      }, null, 'json')
        .done(function(result) {
          console.log("Get answer done: ", result);
          var description = result.info.description;
          gotRemoteAnswer(description)
        })
        .fail(function(xhr, error) {
          console.error("Get answer fail: ", error);
        });
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