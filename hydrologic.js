var map, chart, stormArray, stormPrecip, mapWebServerDate;
var siteNumber = "04074950";//The NWIS site that will be displayed on page load
var webServer = "http://maps.aqua.wisc.edu/hydrologic/";
var mapWebServer ="http://144.92.44.184/geoserver/UWSeaGrant/wms";
var lon = -88.472656;
var lat = 44.558984;
var zoomLevel = 8;
var nexradLoopStartTime, nexradLoopEndTime, nexradLoopCurrentTime;

//onload
$(function () {
	//variables
	var foxWolf_style, foxWolf, NWISpoints_style, NWISpoints, ia_wms, map_date;
	//NEXRAD variables
	mapWebServerDate = "Precip_Event_March_09_1982_2321_GMT";
	dt = new Date(1340560055000);//why this number? Because on this particular day NOTHING HAPPENED. So it's a blank image.
	map_date = dt.getUTCFullYear() + "-" + pad2(dt.getUTCMonth() + 1) + "-" + pad2(dt.getDate()) + "T" + pad2(dt.getUTCHours()) + ":" + pad2(dt.getUTCMinutes());

	// Init tabletop to grab strom data from google sheets
	Tabletop.init({
		key: '1NF92ZMpB9F_nMVJognqh7BTYem_2JNiiKI9rAFXkEII',
		callback: loadStorms,
		simpleSheet: true
	})

	function loadStorms(data) {
		// Grab data from google sheets and load into JSON
		var stormData = [];
		for (var i=0,  dataLen=data.length; i < dataLen; i++) {
			var startTime = Math.round(new Date(data[i]['Start Date'] + " " + data[i]['Start Time (GMT)'] + " GMT").getTime()/1000);
			var endTime = Math.round(new Date(data[i]['End Date'] + " " + data[i]['End Time (GMT)'] + " GMT").getTime()/1000);
			stormData.push([ startTime, endTime, data[i]['Max Precip (in)'], data[i]['Layer Name'], data[i]['Storm Size'] ]);
		}

		//variables
		var title, tempObject, stormDate, startDate, stormDuration;
		//match up the storm web services file with the dates of the precipitation amounts
		stormArrayS = [];
		stormArrayL = [];
		title = 1;
		for (var i = 0; i < stormData.length; i++) {
			tempObject = {
				x : 1000 * (stormData[i][0]),
				//storm end time variable initiation
				precip: (stormData[i][2]),
				startTime : (stormData[i][0]),
				endTime : (stormData[i][1]),
				formatTime: (stormData[i][3]),
				title : "S",//stormData[i][3],
				text : 'Precipitation: ' + stormData[i][2] +  ' in',
				//on storm flag click event, start the nexrad animation
				events: {
					click: function (e) {
						//set the global nexradLoopStartTime and nexradLoopEndTime variables.
						nexradLoopStartTime = roundToHour(e.point.x);
						nexradLoopEndTime = roundToHour(e.point.endTime*1000);
						nexradLoopCurrentTime = nexradLoopEndTime;
						mapWebServerDate = e.point.formatTime;
						//Start the timer and call function to update the Nexrad image
						//updateNexrad();
						//Add storm precipitation data to info box
						stormPrecip = e.point.precip + ' inches';
						$("#precipTotal").html(stormPrecip);
						startDate = Highcharts.dateFormat('%B %d, %Y at %l:%M %P', e.point.startTime*1000);
						$("#startDate").html(startDate);
						stormDate = Highcharts.dateFormat('%B %d, %Y at %l:%M %P', e.point.endTime*1000);
						$("#endDate").html(stormDate);
						//calculate time between two dates
						stormDuration = dateDifference(nexradLoopEndTime, nexradLoopStartTime);
						$("#stormDuration").html(stormDuration);
						ia_wms.setParams({"layers": mapWebServerDate});
						//enable the "clear nexrad" button
						$(".nexrad_control_clear").button("enable");
					}
				},
				size: (stormData[i][4]),
			};
			if (stormData[i][4][0] == "S") {
				// Add small storms
				stormArrayS.push(tempObject);
			} else {
				// Add large storms
				stormArrayL.push(tempObject);
			}
			title++;
		}
		//makes dates on chart appear in local time instead of GMT
		Highcharts.setOptions({
	        global: {
	            useUTC: false
	        }
		});
		chart = new Highcharts.StockChart({
			chart : {
				renderTo : 'container',
				events: {
					redraw: function () {
						var avgPrecip, totalPrecip, dailyMin, dailyMax, avgRound;
						totalPrecip = 0;
						dailyMin = 100;
						dailyMax = 0;
						for (var i = 0; i<this.series[0].points.length;i++) {
							totalPrecip += this.series[0].points[i].y;
							if (this.series[0].points[i].y > dailyMax) {
								dailyMax =  this.series[0].points[i].y;
							}
							if (this.series[0].points[i].y < dailyMin && this.series[0].points[i].y > 0) {
								dailyMin = this.series[0].points[i].y;
							}
						}
						if (this.series[0].points.length !== 0) {
							avgPrecip = totalPrecip/this.series[0].points.length;
							avgRound = Math.round(avgPrecip * 100)/100;
						}
						$("#avgRainfall").html(avgRound);
						$("#dailyMax").html(dailyMax);
						$("#dailyMin").html(dailyMin);
					}
				}
			},
			rangeSelector : {
				buttons: [{
					type: 'all',
					text: 'All'
				}],
				selected: 0
			},
			title : {
				text : '04074950 Wolf River at Langlade, WI',
				style: {
					fontFamily: 'Arimo, sans-serif',
					color: '#375D81',
					fontWeight: 'bold',
					fontSize: '18px'
				}
			},
			yAxis: [
				{
					labels: {
						formatter: function(){
							var three = "3";
							return this.value + ' ft' + three.sup() + '/sec';
						},
						style:{
							color: '#E3CA79'
						}
					},
					title: {
						text: 'Streamflow',
						style:{
							color: '#E3CA79',
							fontWeight: 'bold'
						}
					},
					min: 0
				},
				{
					title: {
						text: 'Precipitation',
						style:{
							color: '#6D97C0',
							fontWeight: 'bold'
						}
						},
					labels: {
						formatter: function() {
							return this.value +' in';
						},
						style: {
							fontFamily: 'Arimo, sans-serif',
								 color: '#6D97C0'
						}
					},
					opposite: true,
					min: 0
				}
			],
			legend: {
				layout: 'vertical',
				align: 'right',
				x: 120,
				verticalAlign: 'top',
				y: 100,
				floating: true,
				backgroundColor: '#FFFFFF'
			},
			series:  [
				{
					name : 'Streamflow',
					color: '#E3D196',
					data : [0],
					id : 'streamflowSeries',
					dataGrouping : {
						enabled : false
					},
					tooltip: {
						yDecimals: 2
					}
				},
				{
					color : '#ffcc66',
					fillColor : '#ffcc66',
					type : 'flags',
					data : stormArrayS,
					onSeries : 'streamflowSeries',
					allowPointSelect: 'true'
				},
				{
					color : '#FF4D4D',
					fillColor : '#FF4D4D',
					type : 'flags',
					data : stormArrayL,
					onSeries : 'streamflowSeries',
					allowPointSelect: 'true'
				}
			]
		});
		chart.addSeries({
			name : 'Precipitation',
			color: '#6D97C0',
			yAxis: 1,
			data : [0],
			id : 'precipSeries',
			zIndex: -1,
			dataGrouping : {
				enabled : false
			},
			tooltip: {
				yDecimals: 2
			}
		});
		//initiate highstocks with a site
		updateChart(siteNumber);
	};

	

	map = L.map('map', {
		center: new L.LatLng(lat,lon),
		zoom: 8,
		minZoom: 8
	});
/* 	var stamenBase = new L.StamenTileLayer("terrain");
	map.addLayer(stamenBase); */
	var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		minZoom: 8
	}).addTo(map);

	//add scale bar to map
	L.control.scale().addTo(map);

	//Initialize the NEXRAD radar image.
/*
	ia_wms = new L.tileLayer.wms(webServer+'data/nexrad.php',
		{
			layers: "web",
			transparent: true,
			format: 'image/png',
			time: map_date
		}
	).addTo(map);
*/

	ia_wms = new L.tileLayer.wms(mapWebServer,
		{
			map: "UWSeaGrant",
			layers: mapWebServerDate,
			width:"600",
			height:"600",
			transparent: true,
			format: 'image/png'
		}
	).addTo(map);

	//pass nexrad a new date and push it to the wms call.
	function updateNexrad(direction) {
		//change the current time into the current format for the web service call
		tempdate = new Date(nexradLoopCurrentTime);
		tempformatted = tempdate.getUTCFullYear() + "-" + pad2(tempdate.getUTCMonth() + 1) + "-" + pad2(tempdate.getDate()) + "T" + pad2(tempdate.getUTCHours()) + ":" + pad2(tempdate.getUTCMinutes());
		//update nexrad layer with new parameters
	}

	//create nexrad button on load disabled
	$(".nexrad_control_clear").button({ disabled: true });
	//When the "Clear NEXRAD" button is clicked
	$(".nexrad_control_clear").click(function() {
		if(ia_wms.wmsParams.time != map_date){
			//set nexrad back to original blank storm date
			//for nexrad
			//ia_wms.setParams({"time": map_date});
			//for wisc.edu
			ia_wms.setParams({"layers": "phony date"});
			//disable "clear nexrad" button
			$(".nexrad_control_clear").button( "disable" );
		}
	});

	var baseLayers = {
		"Open Street Map" : osm,
		//"Stamen Design Terrain": stamenBase
	};

	var overlayMaps = {
		"Nexrad": ia_wms
	};
	var controlOptions = {
		position: "topright"
	};

	//Add a layers controler to the map
	var layersControl = new L.Control.Layers(baseLayers, overlayMaps, controlOptions);
	map.addControl(layersControl);

	//Fox/Wolf watershed geojson
 	foxWolf_style = {
		"width" : 2,
		"fillColor" : "#374C61",
		"opacity" : 0.0,
		"fillOpacity": 0.4
	};

	//ajax call using jquery to fetch external geojson
	$.ajax({
		url: "data/FoxWolfWatershed.geojson",
		dataType: 'json',
		success: function (response) {
			foxWolf = L.geoJson(response, {
				style: foxWolf_style
			});
			foxWolf.addTo(map);
			layersControl.addOverlay(foxWolf, "Fox/Wolf Watershed");
		}
	});

	var catchmentIconUrl = 'img/flag_green_nb.png';
	var catchmentIconInactiveUrl = 'img/flag_yellow_nb.png';
	var catchmentIconSelectedUrl = 'img/flag_green_bg.png';
	var catchmentIconInactiveSelectedUrl = 'img/flag_yellow_bg.png';
	//add catchment sites to map
	var catchmentIcon = L.icon({
		iconUrl: catchmentIconUrl,
		iconSize: [25, 30],
		iconAnchor: [16, 37],
		popupAnchor: [0, -28]
	});

	//add catchment sites to map
	var catchmentIconInactive = L.icon({
		iconUrl: catchmentIconInactiveUrl,
		iconSize: [25, 30],
		iconAnchor: [16, 37],
		popupAnchor: [0, -28]
	});

	//add catchment sites to map
	var catchmentIconSelected = L.icon({
		iconUrl: catchmentIconSelectedUrl,
		iconSize: [20, 25],
		iconAnchor: [16, 37],
		popupAnchor: [0, -28]
	});

	//add catchment sites to map
	var catchmentIconInactiveSelected = L.icon({
		iconUrl: catchmentIconInactiveSelectedUrl,
		iconSize: [20, 25],
		iconAnchor: [16, 37],
		popupAnchor: [0, -28]
	});

	$.ajax({
		url: "data/NWISpoints.geojson",
		dataType: 'json',
		success: function (response) {
			NWISpoints = L.geoJson(response, {
				pointToLayer: function (feature, latlng) {
					var blah = $("td",feature.properties.Description);
					if ($(blah[blah.length-1]).text().indexOf("Present")==-1){
						return L.marker(latlng, {icon: catchmentIconInactive});
					}
					else{
						return L.marker(latlng, {icon: catchmentIcon});
					}
				},
				onEachFeature: onEachFeature
			});
			NWISpoints.addTo(map);
			layersControl.addOverlay(NWISpoints, "NWIS Flags");
		}
	});

	//Styling to set catchment areas invisible
	var catchment_invisible = ({
		"opacity": 0.0,
		"fillOpacity": 0.0
	});
	var catchment_visible = ({
		"strokeWidth": 0,
		"fillColor": '#00005C',
		"fillOpacity": 0.4,
		"opacity" : 0.4,
		"strokeColor": '#ffffff'
	});

	var catchmentLayers = Array();
	var markersLayer;
	//Popup content for NWIS flags
	function onEachFeature(feature, layer) {
		var popupContent = "<div style='font-size:.8em'>" + feature.properties.Description +"</div>";
		markersLayer = layer;
		if (feature.properties && feature.properties.popupContent) {
			popupContent += feature.properties.popupContent;
		}
		layer.bindPopup(popupContent);

		//on click, update highcharts with catchment site data
		layer.on('click',function(){
			updateChart(feature.properties.Name);
			//determine if catchment area is already in catchmentLayers array. If so, reset style to catchment_style.
			if (catchmentLayers["" + feature.properties.Name] != undefined){
				catchmentLayers["" + feature.properties.Name].setStyle(catchment_visible);
			}
			//if not in catchmentLayers array, add to array and addLayer to map.
			else{
				 catchmentArea(("" + feature.properties.Name), catchmentLayers);//call catchmentArea function
			}
			//turn other catchment areas invisible when clicking on a new flag
			for(x in catchmentLayers){
				if(catchmentLayers[x] != catchmentLayers["" + feature.properties.Name]){
					catchmentLayers[x].setStyle(catchment_invisible);
				}
			}
			//make all the markers inactive
			$.each($(".leaflet-marker-icon[src='"+catchmentIconInactiveSelectedUrl+"']"),function(){$(this).attr("src",catchmentIconInactiveUrl);});
			$.each($(".leaflet-marker-icon[src='"+catchmentIconSelectedUrl+"']"),function(){$(this).attr("src",catchmentIconUrl);});
			//first grab that first line of text from the description
			var blah = $("td:first",feature.properties.Description);
			//then take that result and make it all lower case, then make the first letter of each word upper case.
			chart.setTitle({text: ucwords(strtolower($(blah[0]).text())).replace("Wi","WI")});
			if (this.options.icon.options.iconUrl.indexOf("yellow")==-1){
				this.setIcon(catchmentIconSelected);
			}
			else {
				this.setIcon(catchmentIconInactiveSelected);
			}
		});
	};

 	//function to add and style catchment area polygons to map
	function catchmentArea(site, arrayRef) {
		//ajax call using jquery to fetch external geojson
		$.ajax({
			url: "data/catchment/" + site + ".geojson",
			dataType: 'json',
			success: function (response) {
				var catchmentSite = L.geoJson(response, {
					style: catchment_visible
				});
				catchmentSite.addTo(map);
				//add catchment area geojson to the catchmenLayers array
				arrayRef[site] = catchmentSite;
			}
		});
	}

	function updateChart(siteNumber){
		chart.showLoading();

		var task1 = $.Deferred();
		var task2 = $.Deferred();

		var precipData = {
			streamflowArray: [],
			precipArray: []
		}

		// Load streamflow data from csv
		$.get("data/streamflow/" + siteNumber + ".csv", function(csv) {
			var data = $.csv.toArrays(csv)
			
			for (var i=0,  dataLen=data.length; i < dataLen; i++) {
				var recordDate = Math.round(new Date(data[i][0]).getTime());
				precipData.streamflowArray.push([recordDate, parseInt(data[i][1])||0])
			}
			task1.resolve();
		}).error(function(){
			chart.hideLoading();
			alert("Streamflow data for site number " + siteNumber + " cannot be found.");
		});

		// Load precip data from csv
		$.get("data/precip/" + siteNumber + ".csv", function(csv) {
			var data = $.csv.toArrays(csv)
			for (var i=0,  dataLen=data.length; i < dataLen; i++) {
				var recordDate = Math.round(new Date(data[i][0] + " GMT").getTime());
				precipData.precipArray.push([recordDate, parseFloat(data[i][1])||0])
			}
			task2.resolve();
		}).error(function(){
			chart.hideLoading();
			alert("Precipitation data for site number " + siteNumber + " cannot be found.");
		});

		return $.when(task1, task2).done(function(){
			var seriesPrecip = chart.get('precipSeries');
			seriesPrecip.setData(precipData.precipArray,true);
			var seriesStreamFlow = chart.get('streamflowSeries');
			seriesStreamFlow.setData(precipData.streamflowArray,true);
			chart.hideLoading();
			//chart.setTitle({text:"USGS NWIS Site " + siteNumber});
		})
	}
});

//adds leading zero to numbers
function pad2(number) {
    return (number < 10 ? '0' : '') + number;
}

//takes time from storm data array and rounds to the closest hour.
function roundToHour(time){
	var temp = new Date(time);
	temp.setHours(temp.getMinutes() >= 30 ? temp.getHours()+1: temp.getHours());
	temp.setMinutes(0);
	return temp.getTime();
}
//calculates the time difference between two time stamps
function dateDifference(laterdate,earlierdate) {
	var difference, daysDifference, hoursDifference;
	difference = laterdate - earlierdate;

	daysDifference = Math.floor(difference/1000/60/60/24);
	difference -= daysDifference*1000*60*60*24;

	hoursDifference = Math.floor(difference/1000/60/60);
	difference -= hoursDifference*1000*60*60;
	//var minutesDifference = Math.floor(difference/1000/60);
	//difference -= minutesDifference*1000*60
	//var secondsDifference = Math.floor(difference/1000);
	if(daysDifference == 1) {
		return daysDifference + " day " + hoursDifference + " hours";
	}
	else {
		return daysDifference + " days " + hoursDifference + " hours";
	}
}

function ucwords (str) {
    return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
        return $1.toUpperCase();
    });
}

function strtolower (str) {
    return (str+'').toLowerCase();
}

