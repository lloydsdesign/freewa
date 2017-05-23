import React, {
	Component
} from 'react';

import {
	Text,
	Divider,
	Row,
	Title,
	View,
	TextInput,
	Icon,
	Button,
	Subtitle,
	Image,
	TouchableOpacity,
	Spinner
} from '@shoutem/ui';

import {
	InteractionManager,
	ScrollView
} from 'react-native';

import { connect } from 'react-redux';
import { ext } from '../extension';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';

import {
	jsonGuard,
	CMS_REST,
	parseJSON,
	showAlert,
	renderNavLogo
} from '../const';


export class Register extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			loading: false,
			username: '',
			password: '',
			fullName: '',
			email: ''
		};
	}
	
	submitForm()
	{
		const {username, password, fullName, email} = this.state;
		if(username == '' || password == '' || fullName == '' || email == '')
		{
			showAlert('Registration failed. Please fill all input fields.');
			return;
		}
		
		this.setState({ loading: true });
		const { navigateTo, lastPosition } = this.props;
		
		var data = new FormData();
		data.append('mobile_add_admin', '');
		data.append('username', username);
		data.append('password', password);
		data.append('full_name', fullName);
		data.append('email', email);
		
		fetch(CMS_REST, {
			method: 'POST',
			body: data
		})
		.then((response) => response.text())
		.then((response) => {
			response = parseJSON(response);
			
			if(response.status)
			{
				showAlert('Successfully registered as '+ email);
				
				navigateTo({
					screen: this.props.returnScreen,
					props: {
						user: response.data,
						marker: this.props.marker ? this.props.marker : null,
						lastPosition
					}
				});
			}
			else
			{
				showAlert('Registration failed.');
				this.setState({ loading: false });
			}
		});
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
	
	renderSubmitButton()
	{
		const { loading } = this.state;
		
		if(loading)
		{
			return (
				<View styleName="horizontal v-center h-center">
					<Spinner style={{ size: 'large', color: '#00B2C1' }} />
				</View>
			);
		}
		
		return (
			<Button styleName="full-width"  style={{ backgroundColor: '#FAA21B' }} onPress={() => this.submitForm()}>
				<Icon name="add-friend" />
				<Text>REGISTER</Text>
			</Button>
		);
	}
	
	render()
	{
		const { navigateTo, lastPosition } = this.props;
		
		return (
			<ScrollView style={{backgroundColor: '#FFF'}}>		
				<NavigationBar
					renderLeftComponent={() => renderNavLogo()}
					renderRightComponent={() => this.renderNavHome()}
				/>
				
				<Row style={{marginTop: 0, paddingTop: 10}}>
					<View styleName="horizontal h-center">
						<Title style={{color: '#00B2C1'}}>REGISTER</Title>
					</View>
				</Row>
				
				<Divider styleName="line" />

				<TextInput
					autoCapitalize="none"
					autoCorrect={false}
					autoFocus
					maxLength={50}
					enablesReturnKeyAutomatically
					returnKeyType="next"
					onChangeText={(value) => this.setState({username: value.trim()})}
					style={{borderColor: '#CCC', borderWidth: 1, borderRadius: 4}}
					placeholder="Username"
					keyboardAppearance="dark"
				/>
				
				<Divider styleName="line" />
			
				<TextInput
					autoCapitalize="words"
					autoCorrect={false}
					maxLength={50}
					enablesReturnKeyAutomatically
					returnKeyType="next"
					onChangeText={(value) => this.setState({fullName: value.trim()})}
					style={{borderColor: '#CCC', borderWidth: 1, borderRadius: 4}}
					placeholder="Full Name"
					keyboardAppearance="dark"
				/>
				
				<Divider styleName="line" />
			
				<TextInput
					autoCapitalize="none"
					autoCorrect={false}
					maxLength={50}
					enablesReturnKeyAutomatically
					returnKeyType="next"
					keyboardType="email-address"
					onChangeText={(value) => this.setState({email: value.trim().toLowerCase()})}
					style={{borderColor: '#CCC', borderWidth: 1, borderRadius: 4}}
					placeholder="E-mail"
					keyboardAppearance="dark"
				/>
				
				<Divider styleName="line" />
			
				<TextInput
					autoCapitalize="none"
					autoCorrect={false}
					enablesReturnKeyAutomatically
					returnKeyType="next"
					secureTextEntry
					onChangeText={(value) => this.setState({password: value.trim()})}
					style={{borderColor: '#CCC', borderWidth: 1, borderRadius: 4}}
					placeholder="Password"
					keyboardAppearance="dark"
				/>
				
				<Row style={{marginTop: 0, paddingTop: 0}}>
					{this.renderSubmitButton()}
				</Row>
				
				<Row style={{marginTop: 0, paddingTop: 0, paddingBottom: 300}}>
					<Button styleName="full-width" onPress={() => {
						InteractionManager.runAfterInteractions(() => navigateTo({
							screen: ext('Map'),
							props: { lastPosition }
						}));
					}}>
						<Icon name="close" />
						<Text>CANCEL</Text>
					</Button>
				</Row>
			</ScrollView>
		);
	}
}

export default connect(
	undefined,
	{ navigateTo }
)(Register);