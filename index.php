<?php
// On "command"?
$cmd = trim($_REQUEST['cmd']);
if ($cmd) {
  if (strpos($cmd, $prefix = 'wrtc_') === 0) {
    $cmd = preg_replace("/^{$prefix}/", '', $cmd);
    require_once(__DIR__ . '/server/wrtc.php');
  }
}
// Resourced cache?
$cache = '';//microtime(true);
?>
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, minimum-scale=1.0, initial-scale=1.0, user-scalable=yes" />
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

      <div id="room-box" class="clearfix hidden">
        <form id="room-form">
          <div class="form-group">
            <div class="input-group">
              <span class="input-group-addon">Room ID:</span>
              <input type="text" name="rid" class="form-control input-sm" />
            </div>
          </div>
          <div class="form-group">
            <div class="text-left col-xs-6">
              <button id="btn-new-room" class="btn btn-default btn-sm">Create new room</button>
            </div>
            <div class="text-right col-xs-6">
              <button id="btn-join-room" class="btn btn-primary btn-sm">Join room</button>
            </div>
          </div>
        </form>
        <label>Room list:</label>
        <div id="room-list" class="clearfix"></div>
      </div>
      <!-- .end#communication box -->

      <!-- communication box -->
      <div id="comm-box" class="clearfix hidden">
        <div class="col-xs-12">
          <h3 class="room-label-h">Room ID: <span></span></h3>
        </div>
        <div class="col-xs-12">
          <div class="video-box video-local">
            <video id="localVideo" autoplay playsinline></video>
          </div>
          <div class="video-box video-remote">
            <video id="remoteVideo" autoplay playsinline></video>
          </div>
        </div>
        <div class="col-xs-12">
          <!--<button id="startButton" class="btn btn-default">Start</button>-->
          <!--<button id="callButton" disabled="disabled" class="btn btn-default">Call</button>-->
          <button id="getAnswerButton" class="btn btn-primary">Get answer</button>
          <button id="fetchIceCandidatesButton" class="btn btn-success">Fetch IceCandidates</button>
          <button id="hangupButton" disabled="disabled" class="btn btn-default">Hang Up</button>
        </div>
      </div>
      <!-- .end#communication box -->
    </div>

    <script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>
    <script src="js/main.js?<?php echo $cache; ?>"></script>
  </body>
</html>