<?php

/**
 * 
 */
class WRTC
{
    /**
     * @var stdClass
     */
    public $sess;

    /**
     * @var string
     */
    public $roomId;

    /**
     * @var string
     */
    public $peerId;

    /**
     * @var string
     */
    public $roomFilename;

    /**
     * @var array
     */
    public $roomFileData;

    /**
     * 
     */
    static function resJSON($data, array $opts = array())
    {
        header('Content-Type: application/json');
        echo json_encode($data);
    }

    /**
     * 
     */
    static function resErr($info, array $opts = array())
    {
        return static::resJSON(array(
            'status' => 0, 'info' => $info,
        ));
    }

    /**
     * 
     */
    static function resOK($info = null, array $opts = array())
    {
        return static::resJSON(array(
            'status' => 1, 'info' => $info,
        ));
    }

    /**
     * 
     */
    static function sessRef(array $opts = array())
    {
        // Init + uses session
        @session_start();
        if (!isset($_SESSION['WRTC'])) {
            $_SESSION['WRTC'] = array();
        }
        $sessRef =& $_SESSION['WRTC'];
        return $sessRef;
    }

    /**
     * Get room list
     */
    static function roomList(array $opts = array())
    {
        $sessRef =& static::sessRef();
        return $sessRef['/r'];
    }

    /**
     * Get filename of file data of room!
     * @param int|string $roomId Room's id
     * @param array $opts An array of options
     * @return string|false
     */
    static function roomFilename($roomId, array $opts = array())
    {
        $filename = (__DIR__ . '/data/r' . $roomId . '.json');
        @touch($filename);
        return realpath($filename);
    }

    /**
     * Get file data of room!
     * @param int|string $roomId Room's id
     * @param array $data
     * @param array $opts An array of options
     * @return string|false
     */
    static function roomFileData($roomId, array $data = array(), array $opts = array())
    {
        $filename = static::roomFilename($roomId);
        if ($filename) {
            $fData = (array)json_decode(file_get_contents($filename), true);
            if (!empty($data)) {
                $fData = array_replace_recursive($fData, $data);
                file_put_contents($filename, json_encode($fData));
            }
            return $fData;
        }
        return false;
    }

    /**
     * 
     */
    public function __construct($roomId = null)
    {
        // Init + uses session
        $this->sess =& static::sessRef();
        //.end

        // Init room
        $this->roomId = trim($roomId ?: $_REQUEST['rid']);
        if (!$this->roomId) {
            return static::resErr('Missing RoomId...');
        }
        $this->init();
        //.end

        // Init peer
        $this->peerId = trim($peerId ?: $_REQUEST['pid']);
        //.end
    }

    /**
     * 
     */
    protected function init(array $opts = array())
    {
        $this->roomFilename = static::roomFilename($this->roomId);
        $this->roomFileData = static::roomFileData($this->roomId);
        if (empty($this->roomFileData)) {
            $this->roomFileData = array(
                'offer' => null,
                'answer' => null,
                'iceCandidates' => array(),
                'peers' => array(),
                'events' => array(
                    'createdAnswer' => array()
                ),
            );
        }
    }

    /**
     * 
     */
    public function wrtcInit(array $opts = array())
    {
        return static::resOK();
    }

    public function wrtcCreatedOffer()
    {
        $description = $_REQUEST['description'];
        if (empty($description) || !is_array($description)) {
            return static::resErr('Missing offer (description)...');
        }
        $this->roomFileData['offer'] = $description;
        return static::resOK(array(
            'offer' => $description
        ));
    }

    public function wrtcGetOffer()
    {
        return static::resOK(array(
            'description' => $this->roomFileData['offer']
        ));
    }

    public function wrtcCreatedIceCandidate()
    {
        $iceCandidate = $_REQUEST['iceCandidate'];
        if (empty($iceCandidate) || !is_array($iceCandidate)) {
            return static::resErr('Missing iceCandidate...');
        }
        if (!isset($this->roomFileData['iceCandidates'][$this->peerId])) {
            $this->roomFileData['iceCandidates'][$this->peerId] = array();
        }
        $uid = md5(serialize($iceCandidate));
        $this->roomFileData['iceCandidates'][$this->peerId][$uid] = $iceCandidate;
        return static::resOK(array(
            'uid' => $uid,
            'pid' => $peerId,
            'iceCandidate' => $iceCandidate
        ));
    }

    public function wrtcGetIceCandidates()
    {
        $iceCandidates = array();
        $_iceCandidates =& $this->roomFileData['iceCandidates'];
        foreach ($_iceCandidates as $_peerId => $_iceCandidateArr) {
            if ($_peerId == $this->peerId) {
                continue;
            }
            $iceCandidates = array_merge($iceCandidates, $_iceCandidateArr);
        }
        return static::resOK(array(
            'iceCandidates' => array_values($iceCandidates)
        ));
    }

    public function wrtcCreatedAnswer()
    {
        $description = $_REQUEST['description'];
        if (empty($description) || !is_array($description)) {
            return static::resErr('Missing answer (description)...');
        }
        $this->roomFileData['answer'] = $description;
        $this->roomFileData['events']['createdAnswer'][$this->peerId] = $description;
        return static::resOK(array(
            'answer' => $description
        ));
    }

    public function wrtcGetAnswer()
    {
        return static::resOK(array(
            'description' => $this->roomFileData['answer']
        ));
    }

    public function wrtcGetEvents()
    {
        $events =& $this->roomFileData['events'];
        return static::resOK(array(
            'events' => $events
        ));
    }

    /**
     * 
     */
    public function __destruct()
    {
        static::roomFileData($this->roomId, $this->roomFileData);
    }
}

$wrtc = new WRTC();
call_user_method('wrtc' . ucfirst($cmd), $wrtc);
$wrtc->__destruct();
die();