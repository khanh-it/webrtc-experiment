<?php
$cache = '';// microtime();
?>
<!DOCTYPE html>
<html>
  <head>
    <meta
      name="viewport"
      content="width=device-width, minimum-scale=1.0, initial-scale=1.0, user-scalable=yes"
    />
    <meta name="theme-color" content="#4F7DC9" />
    <meta charset="UTF-8" />
    <title>Real time communication with WebRTC</title>
    <!-- Latest compiled and minified CSS -->
    <link
      rel="stylesheet"
      href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
      integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
      crossorigin="anonymous"
    />

    <!-- Optional theme -->
    <link
      rel="stylesheet"
      href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css"
      integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp"
      crossorigin="anonymous"
    />

    <link rel="stylesheet" href="css/main.css?<?php echo $cache; ?>" />

    <!-- Latest compiled and minified JavaScript -->
    <script
      src="https://code.jquery.com/jquery-3.3.1.min.js"
      integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
      crossorigin="anonymous"
    ></script>
    <script
      src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"
      integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa"
      crossorigin="anonymous"
    ></script>
  </head>
  <body>
    <div class="container">
        <div class="row">
            <div class="col-xs-12">
                <label>Alice</label>
                <div class="video-box">
                    <video id="pc1localVideo" autoplay playsinline></video>
                </div>
                <div class="video-box">
                    <video id="pc1remoteVideo" autoplay playsinline></video>
                </div>
            </div>
            <div class="col-xs-12">
                <label>Bob</label>
                <div class="video-box">
                    <video id="pc2localVideo" autoplay playsinline></video>
                </div>
                <div class="video-box">
                  <video id="pc2remoteVideo" autoplay playsinline></video>
                </div>
            </div>
        </div>
    </div>

    <div>
      <button id="startButton" class="btn btn-default">Start</button>
      <button id="callButton" disabled="disabled" class="btn btn-default">Call</button>
      <button id="hangupButton" disabled="disabled" class="btn btn-default">Hang Up</button>
    </div>
    <script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>
    <script src="js/main.specs.js?<?php echo $cache; ?>"></script>
    <script src="js/main.pc1.js?<?php echo $cache; ?>"></script>
    <script src="js/main.pc2.js?<?php echo $cache; ?>"></script>
  </body>
</html>
