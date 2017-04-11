import React, {
  Component
} from 'react';

import {
	Screen,
	View,
	TouchableOpacity,
	Image,
	Tile,
	Row,
	Title,
	Subtitle,
	Button,
	Icon,
	Text
} from '@shoutem/ui';

import { Dimensions } from 'react-native';
import MapView from 'react-native-maps';
import { connect } from 'react-redux';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';
import { ext } from '../extension';

const markerImage = require('../assets/icons/marker-image.png');
const markerImageNearest = require('../assets/icons/marker-image-nearest.png');

const jsonGuard = String.fromCharCode(0);
const CMS_BASE = 'http://freewa-back.lloyds-design.hr/';
const CMS_REST = CMS_BASE +'manage.php';


export class Map extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			markers: [],
			lastPosition: null,
			selectedMarker: null,
			hasLoaded: false,
			user: this.props.user ? this.props.user : null
		};
	}
	
	watchID: ?number = null;
	
	componentWillMount()
	{
		navigator.geolocation.getCurrentPosition((position) => {
				this.setState({ lastPosition: position.coords });
			},
			(error) => console.log(JSON.stringify(error)),
			{enableHighAccuracy: true}
		);
		
		this.fetchMarkers();
		
		this.watchID = navigator.geolocation.watchPosition((position) => {
			this.setState({ lastPosition: position.coords });
			this.pickNearestMarker();
		});
	}
	
	componentWillUnmount()
	{
		navigator.geolocation.clearWatch(this.watchID);
	}
	
	fetchMarkers()
	{
		fetch(CMS_REST, {
			headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'}),
			method: 'POST',
			body: 'get_springs='
		})
		.then((response) => response.text())
		.then((response) => {
			response = parseJSON(response);
			this.setState({ markers: adjustMarkerValues(response.springs) });
			this.pickNearestMarker();
		})
		.catch((error) => {
			console.error(error);
		});
	}
	
	pickNearestMarker()
	{
		var markers = this.state.markers;
		const lastPosition = this.state.lastPosition;
		
		if(!markers.length || !lastPosition) return;
		
		markers.sort(function(a, b)
		{
			const firstMarker = {
				latitude: a.latitude,
				longitude: a.longitude
			};
			
			const secondMarker = {
				latitude: b.latitude,
				longitude: b.longitude
			};
			
			return haversine(lastPosition, firstMarker) - haversine(lastPosition, secondMarker);
		});
		
		markers[0].icon = markerImageNearest;
		
		var i;
		for(i = 1; i < markers.length; i++) markers[i].icon = markerImage;
		
		this.setState({ markers });
	}

	animateToRegion()
	{
		const { hasLoaded, lastPosition } = this.state;
		if(hasLoaded || !lastPosition) return;
		
		const currRegion = {
			latitude: lastPosition.latitude,
			longitude: lastPosition.longitude,
			latitudeDelta: 0.3,
			longitudeDelta: 0.3
		};
		
		this.refs.map.animateToRegion(currRegion);
		this.setState({ hasLoaded: true });
	}
	
	renderUserButtons()
	{
		if(this.state.user) return this.renderLogoutButton();
		else return this.renderLoginButton();
	}
	
	renderLoginButton()
	{
		const { navigateTo } = this.props;
		
		return (
			<View styleName="h-center">
				<Button onPress={() => navigateTo({
					screen: ext('Login'),
					props: { returnScreen: ext('AddSpring') }
				})}>
					<Icon name="add-to-favorites-full" />
					<Text>ADD SPRING</Text>
				</Button>
			</View>
		);
	}
	
	renderLogoutButton()
	{
		const { navigateTo } = this.props;
		
		return (
			<View styleName="h-center">
				<Button onPress={() => navigateTo({
					screen: ext('AddSpring'),
					props: {
						returnScreen: ext('Map'),
						user: this.state.user
					}
				})}>
					<Icon name="add-to-favorites-full" />
					<Text>ADD SPRING</Text>
				</Button>
			</View>
		);
	}
	
	renderSelectedMarker()
	{
		const marker = this.state.selectedMarker;
		if(!marker) return null;
		
		const { navigateTo } = this.props;
		var rating;
		
		if(marker.ratingCount) rating = marker.rating +' '+ getRatingString(marker.rating);
		else rating = 'UNRATED';
		
		return (
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
		);
	}

	render()
	{
		const { width, height } = Dimensions.get('window');

		return (
		  <Screen styleName="full-screen">
			<NavigationBar styleName="no-border" title="SPRINGS" />
			
			<MapView
				ref="map"
				onRegionChangeComplete={() => this.animateToRegion()}
				loadingEnabled
				showsUserLocation
				followsUserLocation
				onPress={() => {
					if(this.state.selectedMarker) this.setState({ selectedMarker: null });
				}}
				style={{flex: 0.8, flexDirection: 'column', width: width}}
			>
				{this.state.markers.map((marker, i) => (
					<MapView.Marker
						key={i}
						coordinate={{
							latitude: marker.latitude,
							longitude: marker.longitude
						}}
						title={marker.title.toUpperCase()}
						image={marker.icon}
						onPress={() => this.setState({ selectedMarker: marker })}
					/>
				))}
			</MapView>
			
			{this.renderSelectedMarker()}
			{this.renderUserButtons()}
		  </Screen>
		);
	}
}

export default connect(
	undefined,
	{ navigateTo }
)(Map);

function adjustMarkerValues(markers)
{
	var i, j;
	
	for(i = 0; i < markers.length; i++)
	{
		markers[i].latitude = parseFloat(markers[i].latitude);
		markers[i].longitude = parseFloat(markers[i].longitude);
		markers[i].ratingCount = parseInt(markers[i].ratingCount, 10);
		markers[i].rating = parseFloat(markers[i].rating);
		markers[i].rating = markers[i].rating.toFixed(1);
		markers[i].icon = markerImage;
		
		if(markers[i].image && markers[i].image != "") markers[i].image = CMS_BASE + markers[i].image;
		else markers[i].image = undefined;
		
		for(j = 0; j < markers[i].images.length; j++) markers[i].images[j] = CMS_BASE + markers[i].images[j];
	}
	
	return markers;
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