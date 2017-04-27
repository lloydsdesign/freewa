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

import { Keyboard } from 'react-native';
import MapView from 'react-native-maps';
import { connect } from 'react-redux';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';
import { ext } from '../extension';

const markerImage = require('../assets/icons/marker-image.png');
const markerImageNearest = require('../assets/icons/marker-image-nearest.png');

import {
	jsonGuard,
	CMS_BASE,
	CMS_REST,
	parseJSON,
	getRatingString,
	getDistance
} from '../const';


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
		Keyboard.dismiss();
		
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
			},
			(error) => console.log(JSON.stringify(error)),
			{enableHighAccuracy: true}
		);
	}
	
	componentWillUnmount()
	{
		navigator.geolocation.clearWatch(this.watchID);
	}
	
	fetchMarkers()
	{
		var data = new FormData();
		data.append('get_springs', '');
		
		fetch(CMS_REST, {
			method: 'POST',
			body: data
		})
		.then((response) => response.text())
		.then((response) => {
			response = parseJSON(response);
			this.setState({ markers: adjustMarkerValues(response.springs) });
			this.pickNearestMarker();
		});
	}
	
	pickNearestMarker()
	{
		var markers = this.state.markers;
		const lastPosition = this.state.lastPosition;
		
		if(!markers.length || !lastPosition) return;
		
		markers.sort((a, b) =>
		{
			return getDistance(lastPosition, a) - getDistance(lastPosition, b);
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
		
		const { user } = this.state;
		const { navigateTo } = this.props;
		var rating;
		
		if(marker.ratingCount) rating = marker.rating +' '+ getRatingString(marker.rating);
		else rating = 'UNRATED';
		
		return (
			<View styleName="h-center" style={{shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: {width: 0, height: -3}}}>
				<TouchableOpacity onPress={() => navigateTo({
					screen: ext('SpringDetails'),
					props: { marker, user }
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
		const { markers, selectedMarker } = this.state;
		
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
					if(selectedMarker) this.setState({ selectedMarker: null });
				}}
				style={{flex: 1}}
			>
				{markers.map((marker, i) => (
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
		markers[i].rating = markers[i].rating.toFixed(1);
		markers[i].icon = markerImage;
		
		if(markers[i].image && markers[i].image != "") markers[i].image = CMS_BASE + markers[i].image;
		else markers[i].image = undefined;
		
		for(j = 0; j < markers[i].images.length; j++) markers[i].images[j] = CMS_BASE + markers[i].images[j];
	}
	
	return markers;
}