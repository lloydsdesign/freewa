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

import { Keyboard } from 'react-native';
import { InlineMap } from '@shoutem/ui-addons';
import { connect } from 'react-redux';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';
import { ext } from '../extension';

/*import { DeviceEventEmitter } from 'react-native';
import { SensorManager  } from 'NativeModules';*/

const compassImage = require('../assets/icons/compass-blue.png');

import {
	getRatingString,
	getAzimuth,
	getDistance
} from '../const';


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
		Keyboard.dismiss();
		
		/*SensorManager.startOrientation(1000);
		this.eventID = DeviceEventEmitter.addListener('Orientation', (data) => {
			var rotation = data.azimuth - this.state.azimuth;
			
			if(rotation < 0) rotation += 360;
			else if(rotation > 360) rotation -= 360;
			
			console.log('PHONE ANGLE: '+ data.azimuth);
			console.log('POSITION ANGLE: '+ this.state.azimuth);
			console.log('ROTATION: '+ rotation);
			console.log('\n----------------------------------');
			
			this.setState({ rotation: rotation.toFixed(2) });
		});*/
		
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
		});
	}
	
	componentWillUnmount()
	{
		/*SensorManager.stopOrientation();
		this.eventID.remove();*/
		navigator.geolocation.clearWatch(this.watchID);
	}
	
	calculateDistance()
	{
		const lastPosition = this.state.lastPosition;
		if(!lastPosition) return;
		
		const { marker } = this.props;
		
		var unit = 'm';
		var distance = getDistance(lastPosition, marker);
		
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