import React, {
	Component
} from 'react';

import {
	Text,
	Divider,
	Row,
	Title,
	TextInput,
	Icon,
	Button,
	Subtitle,
	View,
	Image,
	TouchableOpacity
} from '@shoutem/ui';

import { ScrollView } from 'react-native';
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


export class Login extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			email: '',
			password: ''
		};
	}
	
	submitForm()
	{
		const {email, password} = this.state;
		if(email == '' || password == '')
		{
			showAlert('Login failed. Please fill all input fields.');
			return;
		}
		
		const { navigateTo } = this.props;
		
		var data = new FormData();
		data.append('mobile_login', '');
		data.append('email', email);
		data.append('password', password);
		
		fetch(CMS_REST, {
			method: 'POST',
			body: data
		})
		.then((response) => response.text())
		.then((response) => {
			response = parseJSON(response);
			
			if(response.status)
			{
				navigateTo({
					screen: this.props.returnScreen,
					props: {
						user: response.data,
						marker: this.props.marker ? this.props.marker : null
					}
				});
			}
			else showAlert('Login failed. Invalid e-mail or password.');
		});
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
		const { navigateTo } = this.props;
		
		return (
			<ScrollView style={{marginTop: -1, backgroundColor: '#FFF'}} keyboardShouldPersistTaps={true}>
				<NavigationBar
					renderLeftComponent={() => renderNavLogo()}
					renderRightComponent={() => this.renderNavHome()}
				/>
				
				<Row style={{marginTop: 0, paddingTop: 10}}>
					<View styleName="horizontal h-center">
						<Title style={{color: '#00B2C1'}}>LOGIN</Title>
					</View>
				</Row>
				
				<Divider styleName="line" />

				<Row>
					<TextInput
						autoCapitalize="none"
						autoCorrect={false}
						autoFocus
						maxLength={50}
						enablesReturnKeyAutomatically
						returnKeyType="next"
						keyboardType="email-address"
						onChangeText={(value) => this.setState({email: value.trim().toLowerCase()})}
						style={{flex: 1, borderColor: '#CCC', borderWidth: 1, borderRadius: 4}}
						placeholder="E-mail"
					/>
				</Row>
				
				<Row style={{marginTop: 0, paddingTop: 0}}>
					<TextInput
						autoCapitalize="none"
						autoCorrect={false}
						enablesReturnKeyAutomatically
						returnKeyType="next"
						secureTextEntry
						onChangeText={(value) => this.setState({password: value.trim()})}
						style={{flex: 1, borderColor: '#CCC', borderWidth: 1, borderRadius: 4}}
						placeholder="Password"
					/>
				</Row>
				
				<Row style={{marginTop: 0, paddingTop: 0}}>
					<Button styleName="full-width" onPress={() => this.submitForm()}>
						<Icon name="play" />
						<Text>LOGIN</Text>
					</Button>
				</Row>
				
				<Row style={{marginTop: 0, paddingTop: 0, paddingBottom: 300}}>
					<Button styleName="full-width" style={{backgroundColor: '#FAA21B'}} onPress={() => navigateTo({
						screen: ext('Register'),
						props: { returnScreen: this.props.returnScreen }
					})}>
						<Icon name="add-friend" />
						<Text>NOT A MEMBER? REGISTER</Text>
					</Button>
				</Row>
			</ScrollView>
		);
	}
}

export default connect(
	undefined,
	{ navigateTo }
)(Login);