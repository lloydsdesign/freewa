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
	Icon,
	Text,
	Spinner
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
	MAP_DELTA,
	parseJSON,
	getRatingStars,
	getDistance,
	renderNavLogo
} from '../const';


export class Map extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			markers: [],
			lastPosition: null,
			hasLoaded: false,
			selectedMarker: this.props.marker ? this.props.marker : null,
			user: this.props.user ? this.props.user : null
		};
	}
	
	watchID: ?number = null;
	
	componentWillMount()
	{
		Keyboard.dismiss();
		
		navigator.geolocation.getCurrentPosition((position) => {
				this.fetchMarkers(position.coords);
			},
			(error) => console.log(JSON.stringify(error)),
			{enableHighAccuracy: true}
		);
		
		this.watchID = navigator.geolocation.watchPosition((position) => {
				this.fetchMarkers(position.coords);
			},
			(error) => console.log(JSON.stringify(error)),
			{enableHighAccuracy: true}
		);
	}
	
	componentWillUnmount()
	{
		navigator.geolocation.clearWatch(this.watchID);
	}
	
	fetchMarkers(position)
	{
		const min_lat = position.latitude - MAP_DELTA;
		const max_lat = position.latitude + MAP_DELTA;
		const min_lng = position.longitude - MAP_DELTA;
		const max_lng = position.longitude + MAP_DELTA;
		
		var data = new FormData();
		data.append('get_springs', '');
		//data.append('min_lat', min_lat);
		data.append('max_lat', max_lat);
		data.append('min_lng', min_lng);
		data.append('max_lng', max_lng);
		
		fetch(CMS_REST, {
			method: 'POST',
			body: data
		})
		.then((response) => response.text())
		.then((response) => {
			response = parseJSON(response);
			
			this.setState({
				markers: adjustMarkerValues(response.springs),
				lastPosition: position
			});
		})
		.then(() => this.pickNearestMarker());
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
		const { hasLoaded, lastPosition, selectedMarker } = this.state;
		
		var coords;
		if(selectedMarker) coords = selectedMarker;
		else coords = lastPosition;
		
		if(hasLoaded || !coords) return;
		
		if(selectedMarker && lastPosition)
		{
			coords = [
				{
					latitude: selectedMarker.latitude,
					longitude: selectedMarker.longitude
				},
				{
					latitude: lastPosition.latitude,
					longitude: lastPosition.longitude
				}
			];
			
			this.refs.map.fitToCoordinates(coords, {
				edgePadding: {
					top: 20,
					right: 20,
					bottom: 20,
					left: 20
				},
				animated: true
			});
		}
		else
		{
			coords = {
				latitude: coords.latitude,
				longitude: coords.longitude,
				latitudeDelta: 0.3,
				longitudeDelta: 0.3
			};
			
			this.refs.map.animateToRegion(coords);
		}
		
		this.setState({ hasLoaded: true });
	}
	
	renderNavRight()
	{
		if(this.state.user) return this.renderLogoutButton();
		else return this.renderLoginButton();
	}
	
	renderLoginButton()
	{
		const { navigateTo } = this.props;
		
		return (
			<View styleName="container" virtual>
				<TouchableOpacity onPress={() => navigateTo({
					screen: ext('Login'),
					props: { returnScreen: ext('AddSpring') }
				})}>
					<Image style={{ width: 32, height: 32, marginRight: 10 }} source={require('../assets/icons/plus.png')} />
				</TouchableOpacity>
			</View>
		);
	}
	
	renderLogoutButton()
	{
		const { navigateTo } = this.props;
		
		return (
			<View styleName="container" virtual>
				<TouchableOpacity onPress={() => navigateTo({
					screen: ext('AddSpring'),
					props: {
						returnScreen: ext('Map'),
						user: this.state.user
					}
				})}>
					<Image style={{ width: 32, height: 32, marginRight: 10 }} source={require('../assets/icons/plus.png')} />
				</TouchableOpacity>
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
		
		if(marker.ratingCount) rating = <View styleName="horizontal">{getRatingStars(marker.rating)}</View>;
		else rating = <Text style={{color: '#FAA21B'}}>UNRATED</Text>;
		
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
							{rating}
						</Tile>
					</View>
				</TouchableOpacity>
			</View>
		);
	}
	
	renderMap()
	{
		const { markers, selectedMarker } = this.state;
		
		if(!markers.length)
		{
			return (
				<View styleName="horizontal v-center h-center" style={{ flex: 1 }}>
					<Spinner style={{ size: 'large', color: '#00B2C1' }} />
				</View>
			);
		}
		
		return (
			<MapView
				ref="map"
				onRegionChangeComplete={() => this.animateToRegion()}
				loadingEnabled
				showsUserLocation
				//followsUserLocation
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
						//title={marker.title.toUpperCase()}
						image={marker.icon}
						onPress={() => this.setState({ selectedMarker: marker })}
					/>
				))}
			</MapView>
		);
	}

	render()
	{
		return (
		  <Screen styleName="full-screen">
			<NavigationBar
				styleName="no-border"
				renderLeftComponent={() => renderNavLogo()}
				renderRightComponent={() => this.renderNavRight()}
			/>
			
			{this.renderMap()}
			{this.renderSelectedMarker()}
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