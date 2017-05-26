import React, {
	Component
} from 'react';

import {
	ScrollView,
	Keyboard,
	InteractionManager,
	Linking,
	Platform
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

import { connect } from 'react-redux';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';
import { ext } from '../extension';

import {
	fullStar,
	emptyStar,
	CMS_REST,
	getRatingString,
	parseJSON,
	showAlert
} from '../const';


export class SpringDetails extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			rateNumber: 0,
			rateMessage: ''
		};
	}
	
	componentWillMount()
	{
		Keyboard.dismiss();
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
	
	renderLogin()
	{
		const { user, marker, navigateTo, lastPosition } = this.props;
		
		if(user)
		{
			return (
				<Button style={{margin: 10, padding: 10, backgroundColor: '#FAA21B', borderColor: '#FFF'}} onPress={() => {
					InteractionManager.runAfterInteractions(() => navigateTo({
						screen: ext('RateSpring'),
						props: {
							marker,
							user,
							lastPosition
						}
					}));
				}}>
					<Icon name="add-to-favorites-full" />
					<Text>RATE</Text>
				</Button>
			);
		}
		
		return (
			<Button style={{margin: 10, padding: 10, backgroundColor: '#FAA21B', borderColor: '#FFF'}} onPress={() => {
				InteractionManager.runAfterInteractions(() => navigateTo({
					screen: ext('Login'),
					props: {
						marker,
						returnScreen: ext('RateSpring'),
						lastPosition
					}
				}));
			}}>
				<Icon name="add-to-favorites-full" />
				<Text>LOGIN TO RATE</Text>
			</Button>
		);
	}
	
	renderDescription()
	{
		const { marker } = this.props;
		if(marker.description == "") return null;
		
		return (
			<Divider styleName="line" />
			&&
			<Row>
				<View style={{flex: 1}}>
					<Text style={{color: '#00B2C1'}}>SPRING DESCRIPTION</Text>
					<Text />
					<Text style={{fontSize: 13}}>{marker.description}</Text>
				</View>
			</Row>
		);
	}
	
	openMaps()
	{
		const { marker } = this.props;
		var url;
		
		if(Platform.OS == 'ios') url = 'http://maps.apple.com/?daddr='+ marker.latitude +','+ marker.longitude +'&dirflg=w';
		else url = 'google.navigation:q='+ marker.latitude +','+ marker.longitude +'&mode=w';
		
		Linking.openURL(url);
	}
	
	renderRow(image)
	{
		return (
			<Image styleName="featured" source={{ uri: image }} />
		);
	}

	render()
	{
		const { marker } = this.props;
		  
		return (
			<ScrollView>
				<NavigationBar title={marker.title.toUpperCase()} />
				
				<ListView
					horizontal
					data={marker.images}
					renderRow={image => this.renderRow(image)}
				/>
				
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
				
				{this.renderRating()}
				{this.renderLogin()}
				{this.renderDescription()}
				
				<Divider styleName="line" />
				
				<Row style={{backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: {width: 0, height: -3}}}>
					<View style={{flex: 0.5}} styleName="vertical h-center v-center">
						<Text style={{color: '#00B2C1'}}>LATITUDE</Text>
						<Text>{marker.latitude}</Text>
					</View>
					
					<View style={{flex: 0.5}} styleName="vertical h-center v-center">
						<Text style={{color: '#00B2C1'}}>LONGITUDE</Text>
						<Text>{marker.longitude}</Text>
					</View>
				</Row>
				
				<View>
					<Button styleName="full-width" style={{backgroundColor: '#00B2C1'}} onPress={() => this.openMaps()}>
						<Image style={{width: 16, height:16, marginRight: 10}} source={require('../assets/icons/compass.png')} />
						<Text>SHOW DIRECTIONS</Text>
					</Button>
				</View>
			</ScrollView>
		);
	}
}

export default connect(
	undefined,
	{ navigateTo }
)(SpringDetails);