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
	ListView,
	Title,
	Subtitle,
	TouchableOpacity
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
	showAlert,
	renderNavLogo
} from '../const';


export class SpringDetails extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			marker: this.props.marker,
			rateNumber: 0,
			rateMessage: ''
		};
	}
	
	watchID: ?number = null;
	
	componentDidMount()
	{
		Keyboard.dismiss();
	}
	
	renderRating()
	{
		const { marker } = this.state;
		
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
		const { marker } = this.state;
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
		const { marker } = this.state;
		var url;
		
		if(Platform.OS == 'ios') url = 'http://maps.apple.com/?dirflg=w&ll='+ marker.latitude +','+ marker.longitude;
		else url = 'geo:'+ marker.latitude +','+ marker.longitude +'?q='+ marker.latitude +','+ marker.longitude;
		
		Linking.openURL(url);
	}
	
	renderRow(image)
	{
		return (
			<Image styleName="large-banner" source={{ uri: image }} />
		);
	}
	
	renderNavHome()
	{
		const { navigateTo, user, lastPosition } = this.props;
		
		return (
			<View styleName="container" virtual>
				<TouchableOpacity onPress={() => navigateTo({
					screen: ext('Map'),
					props: { user, lastPosition }
				})}>
					<Image style={{ width: 32, height: 32, marginRight: 10 }} source={require('../assets/icons/home.png')} />
				</TouchableOpacity>
			</View>
		);
	}

	render()
	{
		const { marker } = this.state;
		  
		return (
			<ScrollView>
				<NavigationBar
					renderLeftComponent={() => renderNavLogo()}
					renderRightComponent={() => this.renderNavHome()}
				/>
				
				<ListView
					horizontal
					data={marker.images}
					renderRow={image => this.renderRow(image)}
				/>
				
				<Row>
					<View styleName="horizontal h-center v-center">
						<Title>{marker.title.toUpperCase()}</Title>
					</View>
				</Row>
				
				<Divider styleName="line" />
				
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
				{this.renderDescription()}
				
				<Row>
					<Button styleName="full-width" style={{backgroundColor: '#FAA21B'}} onPress={() => this.openMaps()}>
						<Icon name="pin" />
						<Text>SHOW ON MAP</Text>
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