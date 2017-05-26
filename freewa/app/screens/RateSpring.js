import React, {
	Component
} from 'react';

import {
	ScrollView,
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
	Title,
	TouchableOpacity,
	TextInput,
	Spinner
} from '@shoutem/ui';

import { connect } from 'react-redux';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';
import { ext } from '../extension';

import {
	fullStar,
	emptyStar,
	CMS_REST,
	parseJSON,
	showAlert,
	renderNavLogo
} from '../const';


export class RateSpring extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			marker: this.props.marker,
			rateNumber: 0,
			rateMessage: '',
			loading: false
		};
	}
	
	componentWillMount()
	{
		Keyboard.dismiss();
	}
	
	componentWillUnmount()
	{
		Keyboard.dismiss();
	}
	
	rateSpring()
	{
		const { rateNumber, rateMessage } = this.state;
		if(!rateNumber)
		{
			showAlert('Rate failed. Tap on stars to choose rate.');
			return;
		}
		
		this.setState({ loading: true });
		
		const { user, lastPosition, navigateTo } = this.props;
		var { marker } = this.state;
		
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
				
				showAlert('Spring successfully rated.');
				
				navigateTo({
					screen: ext('Map'),
					props: { user, lastPosition, marker }
				});
			}
			else
			{
				showAlert('Rate failed.');
				this.setState({ loading: false });
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
	
	renderRateButton()
	{
		const { loading } = this.state;
		
		if(loading)
		{
			return (
				<View styleName="horizontal v-center h-center" style={{ margin: 10 }}>
					<Spinner style={{ size: 'large', color: '#00B2C1' }} />
				</View>
			);
		}
		
		return (
			<Row>
				<Button styleName="full-width" style={{margin: 10, backgroundColor: '#FAA21B'}} onPress={() => this.rateSpring()}>
					<Icon name="like" />
					<Text>RATE</Text>
				</Button>
			</Row>
		);
	}
	
	renderNavHome()
	{
		const { navigateTo, user, lastPosition } = this.props;
		const { marker } = this.state;
		
		return (
			<View styleName="container" virtual>
				<TouchableOpacity onPress={() => navigateTo({
					screen: ext('Map'),
					props: { user, lastPosition, marker }
				})}>
					<Icon name="back" style={{color: '#00B2C1'}} />
				</TouchableOpacity>
			</View>
		);
	}

	render()
	{
		const { user, lastPosition, navigateTo } = this.props;
		const { marker } = this.state;
		  
		return (
			<ScrollView>
				<NavigationBar
					title="RATE SPRING"
					renderLeftComponent={() => this.renderNavHome()}
				/>
				
				<View style={{ flex: 1, marginTop: 20 }} styleName="vertical h-center">
					<Title style={{marginBottom: 10}}>{marker.title.toUpperCase()}</Title>
					
					<Divider styleName="line" />
					
					<Row>
						<View styleName="horizontal h-center space-between">
							{this.renderStars()}
						</View>
					</Row>
					
					<Divider styleName="line" />
					
					<View styleName="vertical v-center h-center">
						<Text>YOUR PREVIOUS RATE WILL BE OVERWRITTEN</Text>
					</View>
					
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
							underlineColorAndroid="#fff"
						/>
					</Row>
				</View>
				
				{this.renderRateButton()}
			</ScrollView>
		);
	}
}

export default connect(
	undefined,
	{ navigateTo }
)(RateSpring);