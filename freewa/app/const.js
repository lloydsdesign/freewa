const turf = require('turf');

const jsonGuard = String.fromCharCode(0);
const CMS_BASE = 'http://freewa-back.lloyds-design.hr/';
const CMS_REST = CMS_BASE +'manage.php';

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

function getAzimuth(point1, point2)
{
	point1 = turf.point([point1.latitude, point1.longitude]);
	point2 = turf.point([point2.latitude, point2.longitude]);
	
	var angle = turf.bearing(point2, point1);
	
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
	jsonGuard,
	CMS_BASE,
	CMS_REST,
	parseJSON,
	getRatingString,
	getAzimuth,
	getDistance
};