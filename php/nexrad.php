<?php
header("Content-Type: image/png");
$hash = hash("md5",$_SERVER[QUERY_STRING]);
if (file_exists("nexradcache/".$hash.".png")){
	print file_get_contents("nexradcache/".$hash.".png");
	return;
}
else{
	$ch = curl_init("http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r-t.cgi?".$_SERVER[QUERY_STRING]);
	//return the transfer as a string 
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
	curl_setopt($ch, CURLOPT_HEADER, 0);
	$output = curl_exec($ch);
	curl_close($ch);
	file_put_contents("nexradcache/".$hash.".png",$output);
	echo $output;
}
