import React, {
  Component
} from 'react';

import {
  ScrollView,
  Modal,
  TextInput,
  Keyboard
} from 'react-native';

import {
  Row,
  Text,
  Icon,
  Button,
  View,
  Image,
  Divider,
  ListView,
  Title,
  Subtitle,
  TouchableOpacity
} from '@shoutem/ui';

import { InlineMap } from '@shoutem/ui-addons';
import { connect } from 'react-redux';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';
import { ext } from '../extension';

import {
	CMS_REST,
	getRatingString,
	getDistance,
	parseJSON,
	showAlert
} from '../const';

const fullStar = require('../assets/icons/full-star.png');
const emptyStar = require('../assets/icons/empty-star.png');


export class SpringDetails extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			lastPosition: null,
			distance: '',
			rateModal: false,
			rateNumber: 0,
			rateMessage: ''
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
	
	rateSpring()
	{
		const { rateNumber, rateMessage } = this.state;
		if(!rateNumber)
		{
			showAlert('Rate failed. Tap on stars to choose rate.');
			return;
		}
		
		const { user, marker } = this.props;
		this.setState({ rateModal: false });
		
		var data = new FormData();
		data.append('rate_spring', '');
		data.append('rate_number', rateNumber);
		data.append('message', rateMessage);
		data.append('user_id', user.id);
		data.append('spring_id', marker.id);
		
		fetch(CMS_REST, {
			method: 'POST',
			body: data
		})
		.then((response) => response.text())
		.then((response) => {
			response = parseJSON(response);
		});
	}
	
	renderStars()
	{
		const { rateNumber } = this.state;
		var i, img, stars = [];
		
		for(i = 1; i <= 5; i++)
		{
			if(i <= rateNumber) img = fullStar;
			else img = emptyStar;
			
			stars.push(this.getStar(img, i));
		}
		
		return stars;
	}
	
	getStar(img, i)
	{
		return (
			<TouchableOpacity
				key={i - 1}
				onPress={() => this.setState({ rateNumber: i })}
			>
				<Image source={img} />
			</TouchableOpacity>
		);
	}
	
	renderRateModal()
	{
		const { rateModal } = this.state;
		if(!rateModal) return null;
		
		const { marker } = this.props;
		
		return (
			<Modal
				animationType={"fade"}
				visible={rateModal}
				onRequestClose={() => this.setState({ rateModal: false })}
			>
				<View style={{ flex: 1 }} styleName="vertical h-center">
					<Title>RATE SPRING</Title>
					<Subtitle>{marker.title.toUpperCase()}</Subtitle>
					
					<Divider styleName="line" />
					
					<Row>
						<View styleName="horizontal h-center space-between">
							{this.renderStars()}
						</View>
					</Row>
					
					<Divider styleName="line" />
				
					<Row>
						<TextInput
							autoCapitalize="sentences"
							autoCorrect={false}
							enablesReturnKeyAutomatically
							returnKeyType="next"
							multiline
							maxLength={500}
							onChangeText={(value) => this.setState({rateMessage: value.trim()})}
							style={{flex: 1, height: 240, textAlignVertical: 'top', borderColor: '#CCC', borderWidth: 1, borderRadius: 4}}
							placeholder="Message"
						/>
					</Row>
				</View>
				
				<View styleName="horizontal" style={{backgroundColor: '#FFF'}}>
					<Button styleName="full-width" onPress={() => this.rateSpring()}>
						<Icon name="like" />
						<Text>RATE</Text>
					</Button>
					
					<Button styleName="full-width" onPress={() => this.setState({ rateModal: false })}>
						<Icon name="close" />
						<Text>CANCEL</Text>
					</Button>
				</View>
			</Modal>
		);
	}
	
	renderLogin()
	{
		const { user, marker, navigateTo } = this.props;
		
		if(user)
		{
			return (
				<Button styleName="full-width" onPress={() => this.setState({ rateModal: true })}>
					<Icon name="like" />
					<Text>RATE</Text>
				</Button>
			);
		}
		
		return (
			<Button styleName="full-width" onPress={() => navigateTo({
				screen: ext('Login'),
				props: {
					marker,
					returnScreen: ext('SpringDetails')
				}
			})}>
				<Icon name="play" />
				<Text>LOGIN TO RATE</Text>
			</Button>
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
		const { marker, navigateTo } = this.props;
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
				
				{this.renderLogin()}
				{this.renderRateModal()}
				
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
						<View styleName="overlay horizontal v-center h-center fill-parent">
							<Text style={{fontWeight: 'bold'}}>N: {position.latitude.toFixed(6)}</Text>
							<Text>    </Text>
							<Text style={{fontWeight: 'bold'}}>E: {position.longitude.toFixed(6)}</Text>
						</View>
					</InlineMap>
				</View>
				
				<Row>
					<Button styleName="full-width" style={{backgroundColor: '#FAA21B'}}
						onPress={() => navigateTo({
							screen: ext('Compass'),
							props: { marker }
						})}
					>
						<Icon name="pin" />
						<Text>O P E N  C O M P A S S</Text>
					</Button>
				</Row>
			</ScrollView>
		);
	}
}

export default connect(
	undefined,
	{ navigateTo }
)(SpringDetails);