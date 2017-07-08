<?php
header("Content-type: text/json");
date_default_timezone_set('UTC');

$file = explode("\n",file_get_contents("https://docs.google.com/spreadsheets/d/1NF92ZMpB9F_nMVJognqh7BTYem_2JNiiKI9rAFXkEII/pub?gid=1322418062&single=true&output=tsv"));
$sizeof_arr = sizeof($file);
$events = array();
$eventcounter = 0;
//skip the column headers, so begin $i at 1.
for($i = 1; $i<$sizeof_arr; $i++){
	$data = array_filter(explode("\t",$file[$i]));
	if(sizeof($data) == 7){
		$start_time = strtotime($data[0]." ".$data[1]);
		$end_time = strtotime($data[2]." ".$data[3]);	
		$events[$eventcounter] = array($start_time, $end_time, $data[4], $data[5], $data[6]);
		$eventcounter++;
	}
}
echo json_encode($events);
