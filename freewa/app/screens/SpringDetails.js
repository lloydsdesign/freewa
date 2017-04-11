import React, {
  Component
} from 'react';

import {
  ScrollView
} from 'react-native';

import {
  Row,
  Text,
  Icon,
  Button,
  View,
  Image,
  Divider,
  ListView
} from '@shoutem/ui';

import { InlineMap } from '@shoutem/ui-addons';
import { NavigationBar } from '@shoutem/ui/navigation';

export default class SpringDetails extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			lastPosition: null,
			distance: ''
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
		
		this.watchID = navigator.geolocation.watchPosition((position) => {
			this.setState({ lastPosition: position.coords });
			this.calculateDistance();
		});
	}
	
	componentWillUnmount()
	{
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
			<Row style={{backgroundColor: 'rgba(0,178,193,0.7)', marginTop: -47}}>
				<Text style={{color: '#FFF', fontWeight: 'bold', textAlign: 'center'}}>{distance} FROM YOU</Text>
			</Row>
		);
	}
	
	renderRating()
	{
		const { marker } = this.props;
		
		if(!marker.ratingCount)
		{
			return (
				<Row style={{backgroundColor: '#00B2C1'}}>
					<View style={{flex: 1, backgroundColor: '#00B2C1'}}>
						<Text style={{color: '#FFF', textAlign: 'center'}}>UNRATED</Text>
					</View>
				</Row>
			);
		}
		
		return (
			<Row style={{backgroundColor: '#00B2C1'}}>
				<View style={{flex: 0.4, backgroundColor: '#00B2C1'}}>
					<Text style={{color: '#FFF', textAlign: 'center'}}>RATING</Text>
				</View>
				<View style={{flex: 0.2, backgroundColor: '#FFF'}}>
					<Text style={{color: '#00B2C1', textAlign: 'center', fontSize: 30, fontWeight: 'bold'}}>{marker.rating}</Text>
				</View>
				<View style={{flex: 0.4, backgroundColor: '#00B2C1'}}>
					<Text style={{color: '#FFF', textAlign: 'center', fontWeight: 'bold'}}>{getRatingString(marker.rating)}</Text>
				</View>
			</Row>
		);
	}
	
	renderRow(image)
	{
		return (
			<Image styleName="large-banner" source={{ uri: image }} />
		);
	}

	render()
	{
		const { marker } = this.props;
		const position = {
			latitude: marker.latitude,
			longitude: marker.longitude,
			title: marker.title.toUpperCase()
		};
		  
		return (
			<ScrollView style={{marginTop: -1}}>
				<NavigationBar title={marker.title.toUpperCase()} />
				
				<ListView
					horizontal
					data={marker.images}
					renderRow={image => this.renderRow(image)}
				/>
				
				{this.renderDistance()}
				
				<Row style={{backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: {width: 0, height: -3}}}>
					<View style={{flex: 0.4}} styleName="vertical h-center v-center">
						<Text style={{color: '#00B2C1'}}>TYPE</Text>
						<Text>{marker.type.toUpperCase()}</Text>
					</View>
					
					<View style={{flex: 0.6}} styleName="vertical h-center v-center">
						<Text style={{color: '#00B2C1'}}>CONTRIBUTOR</Text>
						<Text>{marker.user}</Text>
					</View>
				</Row>
				
				<Divider styleName="line" />
				
				{this.renderRating()}
				
				<Divider styleName="line" />
				
				<Row>
					<View style={{flex: 1}}>
						<Text style={{color: '#00B2C1'}}>SPRING DESCRIPTION</Text>
						<Text />
						<Text style={{fontSize: 13}}>{marker.description}</Text>
					</View>
				</Row>

				<View styleName="large-banner">
					<InlineMap
						initialRegion={{
							latitude: position.latitude,
							longitude: position.longitude,
							latitudeDelta: 0.3,
							longitudeDelta: 0.3
						}}
						markers={[position]}
						selectedMarker={position}
						style={{height: 160}}
					>
						<View styleName="overlay horizontal v-center h-center fill-parent" style={{fontWeight: 'bold'}}>
							<Text>N: {position.latitude.toFixed(6)}</Text>
							<Text>    </Text>
							<Text>E: {position.longitude.toFixed(6)}</Text>
						</View>
					</InlineMap>
				</View>
				
				<Row>
					<Button styleName="full-width" style={{backgroundColor: '#FAA21B'}}>
						<Icon name="pin" />
						<Text>O P E N  C O M P A S S</Text>
					</Button>
				</Row>
			</ScrollView>
		);
	}
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