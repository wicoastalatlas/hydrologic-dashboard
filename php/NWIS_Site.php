<?php
// Set the JSON header
header("Content-type: text/json");
//take in the $_GET data from the ajax server call
$siteno = $_GET["siteNo"];

$data2DArray = array();
if ((file_exists ( "../data/streamflow/".$siteno.".csv")) and ($handle = fopen ( "../data/streamflow/".$siteno.".csv" , "r")) !==FALSE){
	while(($dataArray  =  fgetcsv ($handle , 50000 , ',')) !==FALSE) {
		$data2DArray[] = array(strtotime($dataArray[0])*1000,floatval($dataArray[1]));
	}
	//$sitename = $dataArray;
	fclose($handle);
}
$precipArray = array();
if ((file_exists ( "../data/precip/".$siteno.".csv")) and ($precipHandle = fopen ( "../data/precip/".$siteno.".csv" , "r")) !==FALSE){
	while(($precipData  =  fgetcsv ($precipHandle , 50000 , ',')) !==FALSE) {
		$precipArray[] = array(strtotime($precipData[0])*1000,floatval($precipData[1]));
	}
	fclose($precipHandle);
}

echo json_encode(array("dataArray"=>$data2DArray,"precipArray"=>$precipArray));


