(function($) {
  "use strict";

  // On this codelab, you will be streaming only video (video: true).
  /* const mediaStreamConstraints = {
    audio: false,
    video: { facingMode: { exact: "environment" } }
  }; */

  // Local stream that will be reproduced on the video.
  let iceCandidates = [];
  let localStream;
  let remoteStream;
  let pc2PeerConn;
  let pc2RemotePeerConn; // = new RTCPeerConnection(servers);

  // Video element where stream will be placed.
  const localVideo = document.getElementById("pc2localVideo");
  const remoteVideo = document.getElementById("pc2remoteVideo");

  // Handles success by adding the MediaStream to the video element.
  function gotLocalMediaStream(mediaStream) {
    localStream =  mediaStream;
    localVideo.srcObject = mediaStream;
    // remoteVideo.srcObject = mediaStream;
    pc2PeerConn.addStream(localStream);
  }
  // Handles error by logging a message to the console with the error message.
  function handleLocalMediaStreamError(error) {
    console.log("navigator.getUserMedia error: ", error);
  }

  // Handles remote MediaStream success by adding it as the remoteVideo src.
  function gotRemoteMediaStream(event) {
    console.warn("pc2#gotRemoteMediaStream: ", getPeerName(event.currentTarget), getPeerName(event.target), getPeerName(event.srcElement));
    const mediaStream = event.stream;
    remoteVideo.srcObject = mediaStream;
    remoteStream = mediaStream;
  }

  $(window).on("RTCSessionDescriptionOfferChange", function(
    event,
    description
  ) {
    console.log(
      "pc2PeerConn setRemoteDescription from offer (description): ",
      description
    );
    pc2PeerConn
      .setRemoteDescription(description)
      .then(() => {
        console.log("pc2PeerConn setRemoteDescription done.");
        //
        iceCandidates.forEach(function(iceCandidate) {
          const newIceCandidate = new RTCIceCandidate(iceCandidate);
          pc2PeerConn
            .addIceCandidate(newIceCandidate)
            .then(() => {
              console.log('pc2#addIceCandidate OK');
            })
            .catch(error => {
              console.error('pc2#addIceCandidate NG: ', error);
            });
        });
        //
        pc2PeerConn.createAnswer().then(createdAnswer);
      })
      .catch(error => {
        console.error(
          "pc2PeerConn setRemoteDescription error: ",
          error
        );
      });
  });

  // Logs answer to offer creation and sets peer connection session descriptions.
  function createdAnswer(description) {
    console.log(
      "pc2PeerConn createAnswer and setLocalDescription with answer (): ",
      description
    );
    pc2PeerConn
      .setLocalDescription(description)
      .then(() => {
        console.log(
          "pc2PeerConn setLocalDescription done. Sending answer (description) now..."
        );
        setTimeout(function() {
          $(window).trigger("RTCSessionDescriptionAnswerChange", description);
        }, 512);
      })
      .catch(error => {
        console.error("pc2PeerConn setLocalDescription error: ", error);
      });
  }

  // Connects with new peer candidate.
  function handleConnection(event) {
    const peerConnection = event.target;
    const iceCandidate = event.candidate;

    if (iceCandidate) {
      $(window).trigger("RTCHandleConnectionPc1", iceCandidate);
      console.log(
        `${getPeerName(peerConnection)} ICE candidate:\n` +
          `${iceCandidate.candidate}.`
      );
    }
  }
  $(window).on("RTCHandleConnectionPc2", function(event, iceCandidate) {
    iceCandidates.push(iceCandidate);
  });

  //
  function handleConnectionChange(event) {
    pc2RemotePeerConn = event.target;
    console.log("pc2#handleConnectionChange: ", pc2RemotePeerConn);
  }

  // Initializes local media stream?!
  pc2PeerConn = new RTCPeerConnection(servers);
  pc2PeerConn.addEventListener("icecandidate", handleConnection);
  pc2PeerConn.addEventListener(
    "iceconnectionstatechange",
    handleConnectionChange
  );
  pc2PeerConn.addEventListener("addstream", gotRemoteMediaStream);
  // remote peer
  pc2RemotePeerConn = new RTCPeerConnection(servers);
  pc2RemotePeerConn.addEventListener("icecandidate", handleConnection);
  pc2RemotePeerConn.addEventListener(
    "iceconnectionstatechange",
    handleConnectionChange
  );
  pc2RemotePeerConn.addEventListener("addstream", gotRemoteMediaStream);
  //
  navigator.mediaDevices
    .getUserMedia(mediaStreamConstraints)
    .then(gotLocalMediaStream)
    .catch(handleLocalMediaStreamError);

  // Gets the "other" peer connection.
  function getOtherPeer(peerConnection) {
    return peerConnection === pc2PeerConn
      ? pc2RemotePeerConn
      : pc2PeerConn;
  }

  // Gets the name of a certain peer connection.
  function getPeerName(peerConnection) {
    return peerConnection === pc2PeerConn
      ? "pc2PeerConn"
      : "pc2RemotePeerConn";
  }
})(jQuery);
