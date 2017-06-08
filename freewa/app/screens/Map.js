import React, {
	Component
} from 'react';

import {
	Keyboard,
	AsyncStorage
} from 'react-native';

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
	Spinner,
	Button
} from '@shoutem/ui';

import MapView from 'react-native-maps';
import { connect } from 'react-redux';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';
import { ext } from '../extension';

import {
	jsonGuard,
	CMS_BASE,
	CMS_REST,
	MAP_DELTA,
	parseJSON,
	getRatingStars,
	getDistance,
	renderNavLogo,
	markerImage,
	markerImageNearest
} from '../const';


export class Map extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			markers: [],
			hasLoaded: false,
			lastPosition: this.props.lastPosition ? this.props.lastPosition : null,
			selectedMarker: this.props.marker ? this.props.marker : null,
			user: this.props.user ? this.props.user : null
		};
	}
	
	watchID: ?number = null;
	
	componentWillMount()
	{
		const { lastPosition } = this.state;
		
		if(lastPosition)
		{
			this.doFetchJob(lastPosition);
			return;
		}
		
		navigator.geolocation.getCurrentPosition((position) => this.doFetchJob(position.coords),
			(error) => console.log(JSON.stringify(error)),
			{enableHighAccuracy: true}
		);
	}
	
	componentDidMount()
	{
		Keyboard.dismiss();
		
		this.watchID = navigator.geolocation.watchPosition((position) => this.doFetchJob(position.coords),
			(error) => console.log(JSON.stringify(error)),
			{enableHighAccuracy: true}
		);
		
		this.getUser();
	}
	
	componentWillUnmount()
	{
		navigator.geolocation.clearWatch(this.watchID);
	}
	
	doFetchJob(position)
	{
		this.fetchMarkers(position).then((markers) => {
			this.setState({
				markers: this.pickNearestMarker(markers, position),
				hasLoaded: true,
				lastPosition: position
			});
		});
	}
	
	fetchMarkers(position)
	{
		const min_lat = position.latitude - MAP_DELTA;
		const max_lat = position.latitude + MAP_DELTA;
		const min_lng = position.longitude - MAP_DELTA;
		const max_lng = position.longitude + MAP_DELTA;
		
		var data = new FormData();
		data.append('get_springs', '');
		data.append('min_lat', min_lat);
		data.append('max_lat', max_lat);
		data.append('min_lng', min_lng);
		data.append('max_lng', max_lng);
		
		return fetch(CMS_REST, {
			method: 'POST',
			body: data
		})
		.then((response) => response.text())
		.then((response) => {
			response = parseJSON(response);
			return adjustMarkerValues(response.springs);
		});
	}
	
	getUser()
	{
		const { user } = this.state;
		if(user) return;
		
		AsyncStorage.getItem('UserData').then((user) => {
			if(user) this.setState({ user: JSON.parse(user) });
		});
	}
	
	pickNearestMarker(markers, lastPosition)
	{
		if(!markers.length || !lastPosition) return [];
		
		markers.sort((a, b) =>
		{
			return getDistance(lastPosition, a) - getDistance(lastPosition, b);
		});
		
		markers[0].icon = markerImageNearest;
		
		var i;
		for(i = 1; i < markers.length; i++) markers[i].icon = markerImage;
		
		return markers;
	}
	
	calculateDistance(lastPosition)
	{
		const { selectedMarker } = this.state;
		if(!selectedMarker || !lastPosition) return null;
		
		var unit = 'm';
		var distance = getDistance(lastPosition, selectedMarker);
		
		if(distance >= 1000)
		{
			distance /= 1000;
			distance = parseFloat(distance.toFixed(2));
			unit = 'km';
		}
		else distance = parseInt(distance, 10);
		
		return distance + unit;
	}
	
	renderAddButton()
	{
		if(this.state.user) return this.renderLogoutButton();
		else return this.renderLoginButton();
	}
	
	renderLoginButton()
	{
		const { navigateTo } = this.props;
		const { lastPosition } = this.state;
		
		return (
			<Button style={{padding: 10}} onPress={() => navigateTo({
				screen: ext('Login'),
				props: {
					returnScreen: ext('AddSpring'),
					lastPosition
				}
			})}>
				<Image style={{width: 24, height: 24, marginRight: 10}} source={require('../assets/icons/plus.png')} />
				<Text>ADD NEW SPRING</Text>
			</Button>
		);
	}
	
	renderLogoutButton()
	{
		const { navigateTo } = this.props;
		const { lastPosition, user } = this.state;
		
		return (
			<Button style={{padding: 10}} onPress={() => navigateTo({
				screen: ext('AddSpring'),
				props: {
					returnScreen: ext('Map'),
					user,
					lastPosition
				}
			})}>
				<Image style={{width: 24, height: 24, marginRight: 10}} source={require('../assets/icons/plus.png')} />
				<Text>ADD NEW SPRING</Text>
			</Button>
		);
	}
	
	renderSelectedMarker()
	{
		const marker = this.state.selectedMarker;
		if(!marker) return null;
		
		const { user, lastPosition } = this.state;
		const { navigateTo } = this.props;
		var rating;
		
		var distance = this.calculateDistance(lastPosition);
		if(distance) distance = <Text>{distance} FROM YOU</Text>
		
		if(marker.ratingCount) rating = <View styleName="horizontal">{getRatingStars(marker.rating)}</View>;
		else rating = <Text style={{color: '#FAA21B'}}>UNRATED</Text>;
		
		return (
			<View styleName="h-center" style={{shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: {width: 0, height: -3}}}>
				<TouchableOpacity onPress={() => navigateTo({
					screen: ext('SpringDetails'),
					props: { marker, user, lastPosition }
				})}>
					<View styleName="horizontal" style={{backgroundColor: '#FFF'}}>
						<Image styleName="medium-square rounded-corners" style={{margin: 10}} source={{ uri: marker.image }} />
						<Tile styleName="text-centric" style={{padding: 20}}>
							<Title styleName="h-center">{marker.title.toUpperCase()}</Title>
							<Subtitle styleName="h-center">{marker.type.toUpperCase()}</Subtitle>
							{rating}
							{distance}
						</Tile>
					</View>
				</TouchableOpacity>
			</View>
		);
	}
	
	renderMap()
	{
		const { markers, hasLoaded, selectedMarker, lastPosition } = this.state;
		
		if(!hasLoaded || (!lastPosition && !selectedMarker))
		{
			return (
				<View styleName="horizontal v-center h-center" style={{ flex: 1 }}>
					<Spinner style={{ size: 'large', color: '#00B2C1' }} />
				</View>
			);
		}
		
		var position;
		
		if(selectedMarker) position = selectedMarker;
		else position = lastPosition;
		
		return (
			<MapView
				ref="map"
				initialRegion={{
					latitude: position.latitude,
					longitude: position.longitude,
					latitudeDelta: 0.03,
					longitudeDelta: 0.03
				}}
				loadingEnabled
				showsUserLocation
				onPress={() => {
					if(selectedMarker) this.setState({ selectedMarker: null });
				}}
				style={{ flex: 1 }}
			>
				{markers.map((marker, i) => (
					<MapView.Marker
						key={i}
						coordinate={{
							latitude: marker.latitude,
							longitude: marker.longitude
						}}
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
				/>

				{this.renderMap()}
				{this.renderSelectedMarker()}
				{this.renderAddButton()}
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