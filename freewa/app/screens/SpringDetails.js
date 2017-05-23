import React, {
	Component
} from 'react';

import {
	ScrollView,
	Modal,
	TextInput,
	Keyboard,
	InteractionManager
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
			rateModal: false,
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
	
	rateSpring()
	{
		const { rateNumber, rateMessage } = this.state;
		if(!rateNumber)
		{
			showAlert('Rate failed. Tap on stars to choose rate.');
			return;
		}
		
		const { user } = this.props;
		var { marker } = this.state;
		
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
			
			if(response.status)
			{
				marker.rating = response.data.rating.toFixed(1);
				marker.ratingCount = response.data.ratingCount;
				
				this.setState({ marker });
			}
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
				<View style={{ flex: 1, marginTop: 20 }} styleName="vertical h-center">
					<Title>RATE SPRING</Title>
					<Subtitle style={{marginBottom: 10}}>{marker.title.toUpperCase()}</Subtitle>
					
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
					<Button styleName="full-width" style={{margin: 10, backgroundColor: '#FAA21B'}} onPress={() => this.rateSpring()}>
						<Icon name="like" />
						<Text>RATE</Text>
					</Button>
					
					<Button styleName="full-width" style={{margin: 10}} onPress={() => this.setState({ rateModal: false })}>
						<Icon name="close" />
						<Text>CANCEL</Text>
					</Button>
				</View>
			</Modal>
		);
	}
	
	renderLogin()
	{
		const { user, marker, navigateTo, lastPosition } = this.props;
		
		if(user)
		{
			return (
				<Button style={{margin: 10, padding: 10, backgroundColor: '#FAA21B', borderColor: '#FFF'}} onPress={() => this.setState({ rateModal: true })}>
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
						returnScreen: ext('SpringDetails'),
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
		const { navigateTo, user, lastPosition } = this.props;
		const { marker } = this.state;
		  
		return (
			<ScrollView style={{marginTop: -1}}>
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
				{this.renderRateModal()}
				{this.renderDescription()}
				
				<Row>
					<Button styleName="full-width" style={{backgroundColor: '#FAA21B'}}
						onPress={() => navigateTo({
							screen: ext('Map'),
							props: { marker, user, lastPosition }
						})}
					>
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