(function($) {
  "use strict";
  //
  var roomId;
  var peerId;
  // ++++
  var $roomBox = $('#room-box');
  // ++++
  var $roomFrm = $('#room-form');
  //
  var $commBox = $('#comm-box');

  //
  $roomFrm.on('submit', function(event) {
    event.preventDefault();
  });
  // $roomFrm.find('input').val(new Date().getTime());
  $roomFrm.find('#btn-new-room').on('click', function() {
    var rid = new Date().getTime();
    ssRoomIdList(rid);
    location = ('?rid=' + rid);
  });
  $roomFrm.find('#btn-join-room').on('click', function() {
    var rid = $.trim($roomFrm.find('input').val());
    var pid = peerId || (new Date().getTime());
    if (rid) {
      ssRoomIdList(rid);
      location = ('?rid=' + rid + '&pid=' + pid);
    }
  });
  //.end
})(jQuery);