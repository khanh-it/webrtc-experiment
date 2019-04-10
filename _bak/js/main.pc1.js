(function($) {
  "use strict";

  // On this codelab, you will be streaming only video (video: true).
  /* const mediaStreamConstraints = {
    audio: false,
    video: { facingMode: "user" }
  }; */

  // Local stream that will be reproduced on the video.
  let iceCandidates = [];
  let localStream;
  let remoteStream;
  let pc1PeerConn;
  let pc1RemotePeerConn; // = new RTCPeerConnection(servers);

  // Video element where stream will be placed.
  const localVideo = document.getElementById("pc1localVideo");
  const remoteVideo = document.getElementById("pc1remoteVideo");

  // Handles success by adding the MediaStream to the video element.
  function gotLocalMediaStream(mediaStream) {
    localStream =  mediaStream;
    localVideo.srcObject = mediaStream;
    // remoteVideo.srcObject = mediaStream;
    callButton.disabled = false;
    //
    pc1PeerConn.addStream(localStream);
    pc1PeerConn
      .createOffer({} /* offerOptions */)
      .then(createdOffer)
      .catch(error => {
        console.error("error: ", error);
      });
  }
  // Handles error by logging a message to the console with the error message.
  function handleLocalMediaStreamError(error) {
    console.log("navigator.getUserMedia error: ", error);
  }

  // Handles remote MediaStream success by adding it as the remoteVideo src.
  function gotRemoteMediaStream(event) {
    console.warn("pc1#gotRemoteMediaStream: ", event);
    const mediaStream = event.stream;
    remoteVideo.srcObject = mediaStream;
    remoteStream = mediaStream;
  }

  //
  $(window).on("RTCSessionDescriptionAnswerChange", function(
    event,
    description
  ) {
    // receiving remote description
    console.log(
      "pc1PeerConn setRemoteDescription from answer (description): ",
      description
    );
    //
    pc1PeerConn
      .setRemoteDescription(description)
      .then(() => {
        console.log(
          "pc1PeerConn setRemoteDescription done.",
          pc1RemotePeerConn
        );
        //
        iceCandidates.forEach(function(iceCandidate) {
          const newIceCandidate = new RTCIceCandidate(iceCandidate);
          pc1PeerConn
            .addIceCandidate(newIceCandidate)
            .then(() => {
              console.log('pc1#addIceCandidate OK');
            })
            .catch(error => {
              console.error('pc1#addIceCandidate NG: ', error);
            });
        });
      })
      .catch(error => {
        console.error(
          "pc1PeerConn setRemoteDescription error: ",
          error
        );
      });
  });

  //
  // Logs offer creation and sets peer connection session descriptions.
  function createdOffer(description) {
    console.log(
      "pc1PeerConn setLocalDescription with offer (description):",
      description
    );
    pc1PeerConn
      .setLocalDescription(description)
      .then(() => {
        // sending local description to remote peer
        // ...
        console.log(
          "pc1PeerConn setLocalDescription done. Sending offer (description) now..."
        );
        setTimeout(function() {
          $(window).trigger("RTCSessionDescriptionOfferChange", description);
        }, 512);
      })
      .catch(error => {
        console.error("pc1PeerConn setLocalDescription error: ", error);
      });
  }

  // Connects with new peer candidate.
  function handleConnection(event) {
    const peerConnection = event.target;
    const iceCandidate = event.candidate;

    if (iceCandidate) {
      $(window).trigger("RTCHandleConnectionPc2", iceCandidate);
      console.log(
        `${getPeerName(peerConnection)} ICE candidate:\n` +
          `${iceCandidate.candidate}.`
      );
    }
  }
  $(window).on("RTCHandleConnectionPc1", function(event, iceCandidate) {
    iceCandidates.push(iceCandidate);
  });

  //
  function handleConnectionChange(event) {
    // pc1RemotePeerConn = event.target;
    var srcElement = event.srcElement;
    var currentTarget = event.currentTarget;
    var target = event.target;
    console.log("pc1#handleConnectionChange: ", srcElement === target, pc1PeerConn === target, pc1RemotePeerConn === target);
  }

  // Initializes local media stream?!
  function initMediaStream() {
    // local peer
    pc1PeerConn = new RTCPeerConnection(servers);
    pc1PeerConn.addEventListener("icecandidate", handleConnection);
    pc1PeerConn.addEventListener(
      "iceconnectionstatechange",
      handleConnectionChange
    );
    pc1PeerConn.addEventListener("addstream", gotRemoteMediaStream);
    // remote peer
    pc1RemotePeerConn = new RTCPeerConnection(servers);
    pc1RemotePeerConn.addEventListener("icecandidate", handleConnection);
    pc1RemotePeerConn.addEventListener(
      "iceconnectionstatechange",
      handleConnectionChange
    );
    pc1RemotePeerConn.addEventListener("addstream", gotRemoteMediaStream);
    //
    navigator.mediaDevices
      .getUserMedia(mediaStreamConstraints)
      .then(gotLocalMediaStream)
      .catch(handleLocalMediaStreamError);
  }
  startButton.addEventListener("click", initMediaStream);
  initMediaStream();
  startButton.disabled = true;

  // Initializes remote media stream?!
  callButton.addEventListener("click", function(evt) {});

  // Gets the "other" peer connection.
  function getOtherPeer(peerConnection) {
    return peerConnection === pc1PeerConn
      ? pc1RemotePeerConn
      : pc1PeerConn;
  }

  // Gets the name of a certain peer connection.
  function getPeerName(peerConnection) {
    return peerConnection === pc1PeerConn
      ? "pc1PeerConn"
      : "pc1RemotePeerConn";
  }
})(jQuery);
