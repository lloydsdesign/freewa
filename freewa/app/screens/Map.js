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
			hasLoaded: false,
			user: this.props.user && this.props.user.length ? this.props.user : []
		};
	}
	
	watchID: ?number = null;
	
	componentWillMount()
	{
		this.fetchMarkers();
		
		/*this.watchID = navigator.geolocation.watchPosition((position) => {
			if(!this.state.selectedMarker) return;
			
			this.setState({
				path: [position.coords, selectedMarker.coordinate]
			});
		});*/
	}
	
	/*componentWillUnmount()
	{
		navigator.geolocation.clearWatch(this.watchID);
	}*/
	
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

	animateToCoordinate()
	{
		const { hasLoaded } = this.state;
		if(hasLoaded) return;
		
		/*navigator.geolocation.getCurrentPosition((position) => {
				this.refs.map.animateToCoordinate(position.coords);
			},
			(error) => console.log(JSON.stringify(error)),
			{enableHighAccuracy: true}
		);*/
		
		const currPos = {
			latitude: 45.324995,
			longitude: 14.451417
		};
		
		this.refs.map.animateToCoordinate(currPos);
		
		this.setState({hasLoaded: true});
	}
	
	renderUserButtons()
	{
		if(this.state.user.length) return this.renderLogoutButton();
		else return this.renderLoginButton();
	}
	
	renderLoginButton()
	{
		const { navigateTo } = this.props;
		
		return (
			<View styleName="horizontal">
				<Button styleName="full-width" onPress={() => navigateTo({
					screen: ext('Login'),
					props: {returnScreen: ext('Map')}
				})}>
					<Icon name="right-arrow" />
					<Text>LOGIN</Text>
				</Button>
				
				<Button styleName="full-width" onPress={() => navigateTo({
					screen: ext('Register'),
					props: {returnScreen: ext('Map')}
				})}>
					<Icon name="right-arrow" />
					<Text>REGISTER</Text>
				</Button>
			</View>
		);
	}
	
	renderLogoutButton()
	{
		const { navigateTo } = this.props;
		
		return (
			<View styleName="horizontal">
				<Button styleName="full-width" onPress={() => this.setState({user: []})}>
					<Icon name="close" />
					<Text>LOGOUT</Text>
				</Button>
				
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
			</View>
		);
	}


	render()
	{
		const { navigateTo } = this.props;
		const { width, height } = Dimensions.get('window');

		return (
		  <Screen styleName="full-screen">
			<NavigationBar
			  styleName="no-border"
			  title="SPRINGS"
			/>
			
			<MapView
				ref="map"
				onRegionChangeComplete={() => this.animateToCoordinate()}
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
						onCalloutPress={() => navigateTo({
							screen: ext('SpringDetails'),
							props: { marker }
						})}
					>
						<MapView.Callout style={{width: 160, height: 160}}>
							<View styleName="fill-parent">
								<TouchableOpacity onPress={() => navigateTo({
									screen: ext('SpringDetails'),
									props: { marker }
								})}>
									<Image styleName="medium-square rounded-corners" source={{ uri: marker.image }} resizeMode="cover">
										<Tile>
											<Title>{marker.title.toUpperCase()}</Title>
											<Subtitle>{marker.type.toUpperCase()}</Subtitle>
										</Tile>
									</Image>
								</TouchableOpacity>
							</View>
						</MapView.Callout>
					</MapView.Marker>
				))}
			</MapView>
			
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
	var i;
	for(i = 0; i < markers.length; i++)
	{
		markers[i].latitude = parseFloat(markers[i].latitude);
		markers[i].longitude = parseFloat(markers[i].longitude);
		
		if(markers[i].image && markers[i].image != "") markers[i].image = CMS_BASE + markers[i].image;
		else markers[i].image = undefined;
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
