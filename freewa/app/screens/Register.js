import React, {
	Component
} from 'react';

import {
	Text,
	Row,
	View,
	TextInput,
	Icon,
	Button,
	Spinner
} from '@shoutem/ui';

import {
	InteractionManager,
	ScrollView,
	AsyncStorage,
	Keyboard,
	KeyboardAvoidingView
} from 'react-native';

import { connect } from 'react-redux';
import { ext } from '../extension';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';

import {
	jsonGuard,
	CMS_REST,
	parseJSON,
	showAlert
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
	
	componentWillUnmount()
	{
		Keyboard.dismiss();
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
				
				AsyncStorage.removeItem('UserData').then(() => {
					AsyncStorage.setItem('UserData', JSON.stringify(response.data))
					.then(() => navigateTo({
						screen: this.props.returnScreen,
						props: {
							user: response.data,
							marker: this.props.marker ? this.props.marker : null,
							lastPosition
						}
					}));
				});
			}
			else
			{
				showAlert('Registration failed.');
				this.setState({ loading: false });
			}
		});
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
			<ScrollView style={{backgroundColor: '#FFF'}} keyboardShouldPersistTaps={true}>		
				<NavigationBar title="REGISTER" />

				<KeyboardAvoidingView>
					<TextInput
						autoCapitalize="none"
						autoCorrect={false}
						autoFocus
						maxLength={50}
						enablesReturnKeyAutomatically
						returnKeyType="next"
						onChangeText={(value) => this.setState({username: value.trim()})}
						style={{borderColor: '#CCC', borderWidth: 1, borderRadius: 0, marginLeft: 15, marginRight: 15, marginTop: 10, marginBottom: 5}}
						placeholder="Username"
						keyboardAppearance="dark"
						underlineColorAndroid="#fff"
					/>
		
					<TextInput
						autoCapitalize="words"
						autoCorrect={false}
						maxLength={50}
						enablesReturnKeyAutomatically
						returnKeyType="next"
						onChangeText={(value) => this.setState({fullName: value.trim()})}
						style={{borderColor: '#CCC', borderWidth: 1, borderRadius: 0, marginLeft: 15, marginRight: 15, marginTop: 10, marginBottom: 5}}
						placeholder="Full Name"
						keyboardAppearance="dark"
						underlineColorAndroid="#fff"
					/>
				
					<TextInput
						autoCapitalize="none"
						autoCorrect={false}
						maxLength={50}
						enablesReturnKeyAutomatically
						returnKeyType="next"
						keyboardType="email-address"
						onChangeText={(value) => this.setState({email: value.trim().toLowerCase()})}
						style={{borderColor: '#CCC', borderWidth: 1, borderRadius: 0, marginLeft: 15, marginRight: 15, marginTop: 10, marginBottom: 5}}
						placeholder="E-mail"
						keyboardAppearance="dark"
						underlineColorAndroid="#fff"
					/>
				
					<TextInput
						autoCapitalize="none"
						autoCorrect={false}
						enablesReturnKeyAutomatically
						returnKeyType="next"
						secureTextEntry
						onChangeText={(value) => this.setState({password: value.trim()})}
						style={{borderColor: '#CCC', borderWidth: 1, borderRadius: 0, marginLeft: 15, marginRight: 15, marginTop: 10, marginBottom: 15}}
						placeholder="Password"
						keyboardAppearance="dark"
						underlineColorAndroid="#fff"
					/>
				</KeyboardAvoidingView>
				
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