import React, {
	Component
} from 'react';

import {
	Alert,
	Platform
} from 'react-native';

import {
	View,
	Image
} from '@shoutem/ui';

const turf = require('turf');

const jsonGuard = String.fromCharCode(0);
const CMS_BASE = 'http://admin.freewa.org/';
const CMS_REST = CMS_BASE +'manage.php';
const MAX_UPLOAD_SIZE = 1024 * 1024 * 5;
const MAP_DELTA = 0.5;
const DISCLAIMER_URL = 'https://freewa.org/privacy/';
const fullStar = require('./assets/icons/full-star.png');
const emptyStar = require('./assets/icons/empty-star.png');
const halfStar = require('./assets/icons/half-star.png');
var markerImage, markerImageNearest;

if(Platform.OS == 'ios')
{
	markerImage = require('./assets/icons/flag-ios-basic.png');
	markerImageNearest = require('./assets/icons/flag-ios-nearest.png');
}
else
{
	markerImage = require('./assets/icons/flag-android-basic.png');
	markerImageNearest = require('./assets/icons/flag-android-nearest.png');
}


function renderNavLogo()
{
	return (
		<View styleName="container" virtual>
			<Image style={{ width: 160, height: 30, marginLeft: 20 }} source={require('./assets/icons/logo.png')} />
		</View>
	);
}

function showAlert(message)
{
	Alert.alert('Message', message, [{text: 'OK'}]);
}

function parseJSON(value)
{
	const startPos = value.indexOf(jsonGuard);
	const endPos = value.lastIndexOf(jsonGuard);
	if(startPos > -1 && endPos > startPos) value = value.substring(startPos + jsonGuard.length, endPos);
	
	try
	{
		value = JSON.parse(value);
	}
	catch(SyntaxError)
	{
		return false;
	}
	
	return value;
}

function getRatingString(rating)
{
	const values = [2, 2.4, 3.4, 4.4];
	const strings = ['POOR', 'ACCEPTABLE', 'GOOD', 'VERY GOOD', 'SUPERB'];
	
	var i;
	for(i = 0; i < values.length; i++)
	{
		if(rating <= values[i]) return strings[i];
	}
	
	return strings[strings.length - 1];
}

function getRatingStars(rating)
{
	var i, img, splitStar = false, stars = [];
	for(i = 1; i < 6; i++)
	{
		if(i <= rating) img = fullStar;
		else
		{
			if(!splitStar)
			{
				if(i - rating <= 0.5) img = halfStar;
				else img = emptyStar;
				
				splitStar = true;
			}
			else img = emptyStar;
		}
		
		stars.push(<Image style={{height: 16, width: 16, margin: 4}} key={i - 1} source={img} />);
	}
	
	return stars;
}

function getAzimuth(point1, point2)
{
	point1 = turf.point([point1.latitude, point1.longitude]);
	point2 = turf.point([point2.latitude, point2.longitude]);
	
	var angle = turf.bearing(point1, point2);
	
	if(angle < 0) angle += 360;
	return angle;
}

function getDistance(point1, point2)
{
	point1 = turf.point([point1.latitude, point1.longitude]);
	point2 = turf.point([point2.latitude, point2.longitude]);
	
	return turf.distance(point1, point2) * 1000;
}

export {
	renderNavLogo,
	showAlert,
	jsonGuard,
	CMS_BASE,
	CMS_REST,
	MAP_DELTA,
	MAX_UPLOAD_SIZE,
	DISCLAIMER_URL,
	parseJSON,
	getRatingString,
	getRatingStars,
	getAzimuth,
	getDistance,
	fullStar,
	emptyStar,
	markerImage,
	markerImageNearest
};