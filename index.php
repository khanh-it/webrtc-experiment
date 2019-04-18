<?php
// On "command"?
$cmd = trim($_REQUEST['cmd']);
if ($cmd) {
  if (strpos($cmd, $prefix = 'wrtc_') === 0) {
    $cmd = preg_replace("/^{$prefix}/", '', $cmd);
    require_once(__DIR__ . '/server/wrtc.php');
  }
}
// Page?
$page = 'home';
if ($_GET['rid'] && !$_GET['pid']) {
  $page = 'client';
}
if ($_GET['rid'] && $_GET['pid']) {
  $page = 'peer';
}
?>
<!DOCTYPE html>
<html>
  <head>
  <?php
    require('./layout.head.phtml');
  ?>
  <script>
    /** */
    var _PDAT = <?php echo json_encode(array(
      "roomId" => $_GET['rid'],
      "peerId" => $_GET['pid']
    )); ?>;
    /** .end# */
  </script>
  </head>
  <body>
  <?php
    require("./view.{$page}.phtml");
  ?>
  </body>
</html>