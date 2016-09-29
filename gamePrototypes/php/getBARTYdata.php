<?php

/**
    This php script feeds BART data, stored in MySQL, to a DSG Data Interactive.

    The interactive itself has to create a URL and a DATA string to give to the jQuery $.ajax method.
    The data string has POST variables and their values.
    This file parses those variables, assembles a MySQL query, and send that to MySQL, receiving the result in an array.
    We then process that array into JSON, and simply "echo" it.

    $.ajax captures that text (the JSON) as its iData result. Convoluted but effective. And asynchronous.

    POST variables

    c           command. getStation | byTime | byArrival | byDeparture
    stn0        abbr6 of the origin station, e.g., "Orinda" (optional)
    stn1        abbr6 of the arrival station (optional)
    d           date STRING
    h           hour INTEGER

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
$dbname = "denofinq_barty";
$user = "denofinq_dsg";
$pass = "dsg%37X";
*/

//  tim's macbook version
$dbname = "barty";
$user = "root";
$pass = "root";

//  universal code here
/*

*/

file_put_contents("bartdebug.txt", "\n\n in PHP " . date(DATE_RFC2822) . " post is: " . implode(" | ",$_POST) , FILE_APPEND);

$now =  date(DATE_RFC2822);     //  for debug purposes

$command = $_POST["c"];     //  this is the overall command, the only required part of the POST
$what = $_POST["w"];

if (isset($_POST["d0"])) {
    $d0 = $_POST["d0"];
    $d1 = $_POST["d1"];
    $dateRange = " ( Bdate BETWEEN '" . $d0 . "' AND '" . $d1 . "' ) ";   //  note inclusive
} else {
    $dateRange = "";
}

if (isset($_POST["h0"])) {
    $h0 = $_POST["h0"];
    $h1 = $_POST["h1"];
    $hourRange = " AND ( hour BETWEEN " . $h0 . " AND " . (intval($h1) - 1) . " ) ";    //  note inclusive
} else {
    $hourRange = "";
}

if (isset($_POST["dow"])) {
    $dow = $_POST["dow"];               //      numerical day of week Sun = 1 in MySQL (Sun = 0 is js)
    $dowClause = " AND DAYOFWEEK( Bdate ) = " . (intval($dow) + 1) . " ";
} else {
    $dowClause = " ";
}

//  the variable list part of the (long) BART query
$varList = "X.id AS id, X.Bdate, DAYOFWEEK(X.Bdate) as dow, X.hour, " .
            "X.passengers, entryT.abbr6 AS startAt, entryT.region AS startReg, " .
            "exitT.abbr6 AS endAt, exitT.region AS endReg";

if ($what == "counts") $varList = "COUNT(*)";

//  How the JOIN clauses have to be
$joinList = "\nJOIN stations AS entryT ON (entryT.abbr2 = X.origin) " .
            "JOIN stations AS exitT ON (exitT.abbr2 = X.destination) " ;

$stationClause = "";

//  station of origin

if (isset($_POST["stn0"])) {
    $stn0 = $_POST["stn0"];
    $stationClause .= "AND entryT.abbr6 = '" . $stn0 . "'";
}

//  destination station

if (isset($_POST["stn1"])) {
    $stn1 = $_POST["stn1"];
    $stationClause .= "AND exitT.abbr6 = '" . $stn1 . "'";
}

$orderClause = "";      //      "\nORDER BY Bdate, hour";


//  todo: include weekdays

switch ($command) {
    case "getStations":
        $query = "select name, abbr6 from stations";
        break;

    case "betweenAny":
        $timeRange = $dateRange . $hourRange;
        $query = "SELECT " . $varList . " FROM hours AS X " . $joinList . "\nWHERE " . $timeRange . $dowClause . "\n" . $stationClause . $orderClause;
        break;

    case "byRoute":
        $timeRange = $dateRange . $hourRange;
        $query = "SELECT " . $varList . " FROM hours AS X " . $joinList . "\nWHERE " . $timeRange . $dowClause . "\n" . $stationClause . $orderClause;
        break;

    case "byArrival":
        $timeRange = $dateRange . $hourRange;
        $query = "SELECT " . $varList . " FROM hours AS X " . $joinList . "\nWHERE " . $timeRange . $dowClause . "\n" . $stationClause . $orderClause;
        break;

    case "byDeparture":
        $timeRange = $dateRange . $hourRange;
        $query = "SELECT " . $varList . " FROM hours AS X " . $joinList . "\nWHERE " . $timeRange . $dowClause . "\n" . $stationClause . $orderClause;
        break;

    default:
        break;
}



$query = stripcslashes( $query );
file_put_contents("bartdebug.txt", "\n----\n" . date(DATE_RFC2822) . " submitting query: " . $query , FILE_APPEND);

//  connect to the database
$DBH = CODAP_MySQL_connect("localhost", $user, $pass, $dbname);

//  submit the query and receive the results
$rows = CODAP_MySQL_getQueryResult($DBH, $query);

file_put_contents("bartdebug.txt", "\n    " . date(DATE_RFC2822) . " " . $command . "  got " . count($rows) . " row(s)" , FILE_APPEND);

//  actually get the data back to the javascript:
echo json_encode($rows);


?>