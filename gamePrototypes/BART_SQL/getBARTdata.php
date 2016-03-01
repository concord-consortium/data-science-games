<?php

header('Access-Control-Allow-Origin: *');

function    CODAP_MySQL_connect( $host, $user, $pass, $dbname ) {
    try {
        $DBH = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);	// the database handle

    } catch (PDOException $e) {
        print "Error connecting to the $dbname database!: " . $e->getMessage() . "<br/>";
        die();
    }

    return $DBH;
}


function	CODAP_MySQL_getQueryResult($db, $query)	{
    $sth = $db->prepare($query);    //  $sth = statement handle
    $sth->execute();
    $result = $sth->fetchAll(PDO::FETCH_ASSOC);
	return $result;
}

function	CODAP_MySQL_getOneRow($db, $query)	{
    $result = CODAP_MySQL_getQueryResult($db, $query . " LIMIT 1");
    return $result;
}

function console_log( $data ){
  echo '<script>';
  echo 'console.log('. json_encode( $data ) .')';
  echo '</script>';
}

/*
//      eeps at bluehost version
$dbname = "denofinq_bart";
$user = "denofinq_bart";
$pass = "gr6ose6ro";

*/

//  tim's macbook version
$dbname = "bart-2016-09-30";
$user = "root";
$pass = "root";

//  universal code here
$varList = "X.seq AS id, X.exitTime, entryT.abbr6 AS startAt, entryT.region AS startReg, " .
            "exitT.abbr6 AS endAt, exitT.region AS endReg, T.media AS ticket ";
$joinList = "JOIN stations AS entryT ON (entryT.code = X.entry_id) " .
            "JOIN stations AS exitT ON (exitT.code = X.exit_id) " .
            "JOIN ticketTypes AS T ON (T.type_id = X.type_id)  ";

$command = $_POST["c"];


$stationClause = "";

if (isset($_POST["stn0"])) {
    $stn0 = $_POST["stn0"];
    $stationClause .= " AND entryT.abbr6 = '" . $stn0 . "'";
}

if (isset($_POST["stn1"])) {
    $stn1 = $_POST["stn1"];
    $stationClause .= " AND exitT.abbr6 = '" . $stn1 . "'";
}



switch ($command) {
    case "getStations":
        $query = "select name, abbr6 from stations";
        break;

    case "byTime":
    case "byArrival":
    case "byDeparture":
        $startTime = $_POST["start"];
        $stopTime = $_POST["end"];
        $timeRange = " WHERE exitTime >= '" . $startTime . "' AND exitTime < '" . $stopTime . "'";

        $query = "SELECT " . $varList . " FROM exits AS X " . $joinList . $timeRange . $stationClause;

        break;
}


file_put_contents("bartdebug.txt", "\n\nPT: " . implode(" | ",$_POST) , FILE_APPEND);
file_put_contents("bartdebug.txt", "\nQQ: " . $query , FILE_APPEND);

$query = stripcslashes( $query );
file_put_contents("bartdebug.txt", "\n----\nQQ: " . $query , FILE_APPEND);

$DBH = CODAP_MySQL_connect("localhost", $user, $pass, $dbname);
$rows = CODAP_MySQL_getQueryResult($DBH, $query);
file_put_contents("bartdebug.txt", "\n    " . count($rows) . " row(s)" , FILE_APPEND);
echo json_encode($rows);


?>