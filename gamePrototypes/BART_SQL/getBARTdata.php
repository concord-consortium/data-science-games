<?php

/**
    This php script feeds BART data, stored in MySQL, to a DSG Data Interactive.

    The interactive itself has to create a URL and a DATA string to give to the jQuery $.ajax method.
    The data string has POST variables and their values.
    This file parses those variables, assembles a MySQL query, and send that to MySQL, receiving the result in an array.
    We then process that array into JSON, and simply "echo" it.

    $.ajax captures that text (the JSON) as its iData result. Convoluted but effective. And asynchronous.

    POST variables

    c           command. getStatsion | byTime | byArrival | byDeparture
    stn0        abbr6 of the origin station, e.g., "Orinda" (optional)
    stn1        abbr6 of the arrival station (optional)
    startTime   date-time STRING
    stopTime    date-time STRING

    so the "dataString" might be something like

    ?c=byArrival&stn1=Orinda&startTime=2015-09-30 10:00:00&stopTime=2015-09-30 11:00:00
*/
header('Access-Control-Allow-Origin: *');

/**
    Call this to make a connection to the MySQL database.
    Must call before submitting a query

    Point is to get the database handle ($DBH) needed to make a query.
    Needs:
        host    the server name, e.g., "localhost"
        user    the username that will access the database
        pass    the password
        dbname  the name of the database on the host
*/
function    CODAP_MySQL_connect( $host, $user, $pass, $dbname ) {
    try {
        $DBH = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);	// the database handle

    } catch (PDOException $e) {
        print "Error connecting to the $dbname database!: " . $e->getMessage() . "<br/>";
        die();
    }

    return $DBH;
}

/**
    actually execute a MySQL query
    Parameters:
        db      the database handle
        query   the actual MySQL query, e.g., "SELECT * FROM theTable"
    returns an array of <associated array>s, each of which is one row.
*/

function	CODAP_MySQL_getQueryResult($db, $query)	{
    $sth = $db->prepare($query);    //  $sth = statement handle
    $sth->execute();
    $result = $sth->fetchAll(PDO::FETCH_ASSOC);
	return $result;
}

/**
    Gets one row of data.
*/

function	CODAP_MySQL_getOneRow($db, $query)	{
    $result = CODAP_MySQL_getQueryResult($db, $query . " LIMIT 1");
    return $result;
}

/**
    Utility function: Write to JS console.log.
    NOTE: Does not work in the BART situation, because this php is only a feed.
*/

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
/*

*/

//  the variable list part of the (long) BART query
$varList = "X.seq AS id, X.exitTime, entryT.abbr6 AS startAt, entryT.region AS startReg, " .
            "exitT.abbr6 AS endAt, exitT.region AS endReg, T.media AS ticket ";

//  How the JOIN clauses have to be
$joinList = "JOIN stations AS entryT ON (entryT.code = X.entry_id) " .
            "JOIN stations AS exitT ON (exitT.code = X.exit_id) " .
            "JOIN ticketTypes AS T ON (T.type_id = X.type_id)  ";

$command = $_POST["c"];     //  this is the overall command, the only required part of the POST


$stationClause = "";

//  station of origin

if (isset($_POST["stn0"])) {
    $stn0 = $_POST["stn0"];
    $stationClause .= " AND entryT.abbr6 = '" . $stn0 . "'";
}

//  destination station

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