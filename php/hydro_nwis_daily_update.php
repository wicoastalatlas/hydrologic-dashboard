<?php
//if in web accessible folder, use this for protection from accidentally running script
if (!isset($_REQUEST['check']) || $_REQUEST['check']!="check"){
	print "check parameter not passed";
	die;
}
$folderLocation = 'C:/ms4w/Apache/htdocs/hydrologic/php/';
$streamflowArray = array("04074950","04077630","04078500","040851325","04072150","040851385","04084911","441624088045601","04084445","04082400","04073462","04073468","04073466","04073473","04073365","04073500","04084445","04081000","04080000","04079000");
$precipArray = array("434625088284900","434451088272300", "040851325","441624088045601");
$streamflowFolder = "streamflow";
$precipFolder = "precip";
$today = date('Y-m-d', time() - 60 * 60 * 24);

//collect streamflow data
foreach ($streamflowArray as $value) {

    $curSite = $value;
	$dataURL = "http://waterdata.usgs.gov/nwis/dv?site_no=".$curSite."&cb_00060=on&begin_date=".$today."&format=rdb";
	loadStreamflow($folderLocation,$dataURL, $curSite, $streamflowFolder);
}
//collect precipitation data
foreach ($precipArray as $value) {

    $curSite = $value;
	$dataURL = "http://waterdata.usgs.gov/nwis/dv?&site_no=".$curSite."&cb_00045=on&begin_date=".$today."&format=rdb";
	loadStreamflow($folderLocation, $dataURL, $curSite, $precipFolder);
}

function loadStreamflow($location, $FileName, $siteName, $folder) {
$csvText = "";
$dateArray = "";
$valueArray = "";
$fd = fopen($FileName, 'r');
$writeFile = fopen($location.$folder.'/'.$siteName.'.csv', 'a');

 while (!feof($fd)) {

 $Line = fgets($fd);
 if ($Line{0} == "U") {
$column = explode("\t", $Line);

$csvText .= $dateArray;
$csvText .= $valueArray;


$tempDate = convertDateString($column[2]);
$tempValue = $column[3];

if ($tempValue == "Ice") {
$tempValue = -33;
}

if ($tempValue != "***") {
$dateArray .= "\n".$tempDate.",".$tempValue;
}

}
  	}
  	 $csvText .= "$dateArray";

  	 fwrite($writeFile, $csvText);
fclose($writeFile);

}
function convertDateString($oldString) {
$tempyear = substr($oldString, 0, 4);
$tempmonth = substr($oldString, 5, 2);
$tempday = substr($oldString, 8, 2);

$newString = "$tempmonth/$tempday/$tempyear";
return $newString;
}

?>