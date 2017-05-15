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

import {
	Keyboard,
	DeviceEventEmitter
} from 'react-native';

import { InlineMap } from '@shoutem/ui-addons';
import { connect } from 'react-redux';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';
import { ext } from '../extension';
const ReactNativeHeading = require('react-native-heading');

const compassImageFar = require('../assets/icons/compass-blue.png');
const compassImageNear = require('../assets/icons/compass-orange.png');

import {
	getRatingStars,
	getAzimuth,
	getDistance,
	renderNavLogo
} from '../const';


export class Compass extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			lastPosition: null,
			distance: '',
			img: compassImageFar,
			azimuth: 0,
			heading: 0
		};
	}
	
	watchID: ?number = null;
	
	componentWillMount()
	{
		const { marker } = this.props;
		
		Keyboard.dismiss();
		ReactNativeHeading.start(10);
		
		DeviceEventEmitter.addListener('headingUpdated', data => {
			this.setState({ heading: data });
		});
		
		navigator.geolocation.getCurrentPosition((position) => {
				this.setState({
					lastPosition: position.coords,
					azimuth: getAzimuth(position.coords, marker)
				});
				
				this.calculateDistance();
			},
			(error) => console.log(JSON.stringify(error)),
			{enableHighAccuracy: true}
		);
		
		this.watchID = navigator.geolocation.watchPosition((position) => {
				this.setState({
					lastPosition: position.coords,
					azimuth: getAzimuth(position.coords, marker)
				});
				
				this.calculateDistance();
			},
			(error) => console.log(JSON.stringify(error)),
			{enableHighAccuracy: true}
		);
	}
	
	componentWillUnmount()
	{
		ReactNativeHeading.stop();
		DeviceEventEmitter.removeAllListeners('headingUpdated');
		navigator.geolocation.clearWatch(this.watchID);
	}
	
	calculateDistance()
	{
		const lastPosition = this.state.lastPosition;
		if(!lastPosition) return;
		
		const { marker } = this.props;
		
		var unit = 'm';
		var img = compassImageFar;
		var distance = getDistance(lastPosition, marker);
		
		if(distance >= 1000)
		{
			distance /= 1000;
			distance = distance.toFixed(2);
			unit = 'km';
		}
		else
		{
			distance = parseInt(distance, 10);
			if(distance <= 100) img = compassImageNear;
		}
		
		this.setState({
			distance: distance + unit,
			compassImage: img
		});
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
	
	renderNavHome()
	{
		const { navigateTo, user } = this.props;
		
		return (
			<View styleName="container" virtual>
				<TouchableOpacity onPress={() => navigateTo({
					screen: ext('Map'),
					props: { user }
				})}>
					<Image style={{ width: 32, height: 32, marginRight: 10 }} source={require('../assets/icons/home.png')} />
				</TouchableOpacity>
			</View>
		);
	}

	render()
	{
		const { marker, navigateTo } = this.props;
		const { azimuth, heading, compassImage } = this.state;
		
		var rotation = azimuth - heading;
		
		if(rotation < 0) rotation += 360;
		else if(rotation > 360) rotation -= 360;
		
		rotation = parseInt(rotation, 10);
		var rating;
		
		if(marker.ratingCount) rating = <View styleName="horizontal">{getRatingStars(marker.rating)}</View>;
		else rating = <Text style={{color: '#FAA21B'}}>UNRATED</Text>;
		  
		return (
			<Screen styleName="full-screen">
				<NavigationBar
					renderLeftComponent={() => renderNavLogo()}
					renderRightComponent={() => this.renderNavHome()}
				/>
				
				<View style={{flex: 1}}>
					<Image styleName="large-square" source={compassImage} style={{transform: [{rotate: rotation +'deg'}]}} />
				
					{this.renderDistance()}
				</View>
				
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
								{rating}
							</Tile>
						</View>
					</TouchableOpacity>
				</View>
			</Screen>
		);
	}
}

export default connect(
	undefined,
	{ navigateTo }
)(Compass);