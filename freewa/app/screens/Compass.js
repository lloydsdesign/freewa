import React, {
  Component
} from 'react';

import {
  Screen,
  Image,
  Row,
  View,
  TouchableOpacity,
  Tile,
  Title,
  Subtitle,
  Text
} from '@shoutem/ui';

import { InlineMap } from '@shoutem/ui-addons';
import { connect } from 'react-redux';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';
import { ext } from '../extension';

import { DeviceEventEmitter } from 'react-native';
import { SensorManager  } from 'NativeModules';

const compassImage = require('../assets/icons/compass-blue.png');


export class Compass extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			lastPosition: null,
			distance: '',
			azimuth: 0,
			rotation: 0
		};
	}
	
	watchID: ?number = null;
	eventID: ?number = null;
	
	componentWillMount()
	{
		const { marker } = this.props;
		const springPos = {
			latitude: marker.latitude,
			longitude: marker.longitude
		};
		
		SensorManager.startOrientation(100);
		eventID = DeviceEventEmitter.addListener('Orientation', (data) => {
			//var rotation = data.azimuth + this.state.azimuth;
			var rotation = data.azimuth;
			
			if(rotation < 0) rotation += 360;
			else if(rotation > 360) rotation -= 360;
			
			this.setState({ rotation: rotation.toFixed(2) });
		});
		
		navigator.geolocation.getCurrentPosition((position) => {
				this.setState({
					lastPosition: position.coords,
					azimuth: getAzimuth(position.coords, springPos)
				});
				
				this.calculateDistance();
			},
			(error) => console.log(JSON.stringify(error)),
			{enableHighAccuracy: true}
		);
		
		this.watchID = navigator.geolocation.watchPosition((position) => {
			this.setState({
				lastPosition: position.coords,
				azimuth: getAzimuth(position.coords, springPos)
			});
			
			this.calculateDistance();
		});
	}
	
	componentWillUnmount()
	{
		SensorManager.stopOrientation();
		eventID.remove();
		navigator.geolocation.clearWatch(this.watchID);
	}
	
	calculateDistance()
	{
		const lastPosition = this.state.lastPosition;
		if(!lastPosition) return;
		
		const { marker } = this.props;
		const position = {
			latitude: marker.latitude,
			longitude: marker.longitude
		};
		
		var unit = 'm';
		var distance = haversine(lastPosition, position);
		
		if(distance >= 1000)
		{
			distance /= 1000;
			distance = distance.toFixed(2);
			unit = 'km';
		}
		else distance = parseInt(distance, 10);
		
		this.setState({ distance: distance + unit });
	}
	
	renderDistance()
	{
		const distance = this.state.distance;
		if(distance == '') return null;
		
		return (
			<Row style={{backgroundColor: 'rgba(0,178,193,0.7)'}}>
				<Text style={{color: '#FFF', fontWeight: 'bold', textAlign: 'center'}}>{distance} FROM YOU</Text>
			</Row>
		);
	}

	render()
	{
		const { marker, navigateTo } = this.props;
		const { rotation } = this.state;
		var rating;
		
		if(marker.ratingCount) rating = marker.rating +' '+ getRatingString(marker.rating);
		else rating = 'UNRATED';
		  
		return (
			<Screen styleName="full-screen">
				<NavigationBar title={marker.title.toUpperCase()} />
				
				<View styleName="h-center" style={{shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: {width: 0, height: -3}}}>
					<TouchableOpacity onPress={() => navigateTo({
						screen: ext('SpringDetails'),
						props: { marker }
					})}>
						<View styleName="horizontal" style={{backgroundColor: '#FFF'}}>
							<Image styleName="medium-square rounded-corners" style={{margin: 10}} source={{ uri: marker.image }} />
							<Tile styleName="text-centric" style={{padding: 20}}>
								<Title styleName="h-center">{marker.title.toUpperCase()}</Title>
								<Subtitle styleName="h-center">{marker.type.toUpperCase()}</Subtitle>
								<Text styleName="h-center" style={{color: '#FAA21B'}}>{rating}</Text>
							</Tile>
						</View>
					</TouchableOpacity>
				</View>
				
				<Image styleName="large-square" source={compassImage} style={{transform: [{rotate: rotation +'deg'}]}} />
				
				{this.renderDistance()}
			</Screen>
		);
	}
}

export default connect(
	undefined,
	{ navigateTo }
)(Compass);

function toRad(num)
{
	return num * Math.PI / 180;
}

function haversine(start, end, options)
{
	options = options || {};

	const radii = {
		km:    6371,
		mile:  3960,
		meter: 6371000,
		nmi:   3440
	};

	const R = options.unit in radii ? radii[options.unit] : radii.meter;

	const dLat = toRad(end.latitude - start.latitude);
	const dLon = toRad(end.longitude - start.longitude);
	const lat1 = toRad(start.latitude);
	const lat2 = toRad(end.latitude);

	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c;
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

function getAzimuth(a, b)
{
	var azimuth = 0;
	
	const ap = LocationToPoint(a, true);
	const bp = LocationToPoint(b, true);
	const br = RotateGlobe(b, a, bp.radius, ap.radius);
	
	if((br.z * br.z + br.y * br.y) > 1.0e-6)
	{
		const theta = Math.atan2(br.z, br.y) * 180 / Math.PI;
		azimuth = 90 - theta;
		
		if(azimuth < 0) azimuth += 360;
		else if(azimuth > 360) azimuth -= 360;
		
		azimuth = azimuth.toFixed(2);
	}
	
	return parseFloat(azimuth);
}

function LocationToPoint(c, oblate)
{
	const lat = c.latitude * Math.PI / 180.0;
	const lon = c.longitude * Math.PI / 180.0;
	const radius = oblate ? EarthRadiusInMeters(lat) : 6371009;
	const clat   = oblate ? GeocentricLatitude(lat)  : lat;
	
	const cosLon = Math.cos(lon);
	const sinLon = Math.sin(lon);
	const cosLat = Math.cos(clat);
	const sinLat = Math.sin(clat);
	var x = radius * cosLon * cosLat;
	var y = radius * sinLon * cosLat;
	var z = radius * sinLat;
	
	const cosGlat = Math.cos(lat);
	const sinGlat = Math.sin(lat);
	
	const nx = cosGlat * cosLon;
	const ny = cosGlat * sinLon;
	const nz = sinGlat;
	
	/*x += c.elv * nx;
	y += c.elv * ny;
	z += c.elv * nz;*/
	
	return {'x': x, 'y': y, 'z': z, 'radius': radius, 'nx': nx, 'ny': ny, 'nz': nz};
}

function EarthRadiusInMeters(latitudeRadians)
{
	const a = 6378137.0;
	const b = 6356752.3;
	const cos = Math.cos(latitudeRadians);
	const sin = Math.sin(latitudeRadians);
	const t1 = a * a * cos;
	const t2 = b * b * sin;
	const t3 = a * cos;
	const t4 = b * sin;
	
	return Math.sqrt((t1 * t1 + t2 * t2) / (t3 * t3 + t4 * t4));
}

function GeocentricLatitude(lat)
{
	const e2 = 0.00669437999014;
	const clat = Math.atan((1.0 - e2) * Math.tan(lat));
	
	return clat;
}

function RotateGlobe(b, a, bradius, aradius, oblate)
{
	const br = {'latitude': b.latitude, 'longitude': (b.longitude - a.longitude)};
	const brp = LocationToPoint(br, oblate);

	var alat = -a.latitude * Math.PI / 180.0;
	if(oblate) alat = GeocentricLatitude(alat);
	
	const acos = Math.cos(alat);
	const asin = Math.sin(alat);

	const bx = (brp.x * acos) - (brp.z * asin);
	const by = brp.y;
	const bz = (brp.x * asin) + (brp.z * acos);

	return {'x': bx, 'y': by, 'z': bz, 'radius': bradius};
}