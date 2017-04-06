import React, {
  Component
} from 'react';

import {
	Screen,
	View,
	TouchableOpacity,
	Image,
	Tile,
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
			selectedMarker: null,
			hasLoaded: false,
			user: this.props.user ? this.props.user : null
		};
	}
	
	componentWillMount()
	{
		this.fetchMarkers();
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
		})
		.catch((error) => {
			console.error(error);
		});
	}

	animateToRegion()
	{
		if(this.state.hasLoaded) return;
		
		/*navigator.geolocation.getCurrentPosition((position) => {
				this.refs.map.animateToCoordinate(position.coords);
			},
			(error) => console.log(JSON.stringify(error)),
			{enableHighAccuracy: true}
		);*/
		
		const currRegion = {
			latitude: 45.324995,
			longitude: 14.451417,
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
					<Icon name="right-arrow" />
					<Text>ADD SPRING</Text>
				</Button>
			</View>
		);
	}
	
	renderLogoutButton()
	{
		const { navigateTo } = this.props;
		
		return (
			<View styleName="horizontal">
				<Button styleName="full-width" onPress={() => navigateTo({
					screen: ext('AddSpring'),
					props: {
						returnScreen: ext('Map'),
						user: this.state.user
					}
				})}>
					<Icon name="right-arrow" />
					<Text>ADD SPRING</Text>
				</Button>
				
				<Button styleName="full-width" onPress={() => this.setState({ user: null })}>
					<Icon name="close" />
					<Text>LOGOUT</Text>
				</Button>
			</View>
		);
	}
	
	renderSelectedMarker()
	{
		const marker = this.state.selectedMarker;
		if(!marker) return null;
		
		const { navigateTo } = this.props;
		
		return (
			<View styleName="h-center">
				<Button onPress={() => this.setState({ selectedMarker: null })}>
					<Icon name="down-arrow" />
					<Text>CLOSE</Text>
				</Button>
				
				<TouchableOpacity onPress={() => navigateTo({
					screen: ext('SpringDetails'),
					props: { marker }
				})}>
					<Image styleName="large-banner" source={{ uri: marker.image }}>
						<Tile>
							<Title>{marker.title.toUpperCase()}</Title>
							<Subtitle>{marker.type.toUpperCase()}</Subtitle>
						</Tile>
					</Image>
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
						image={markerImage}
						onPress={(e) => this.setState({ selectedMarker: marker })}
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
