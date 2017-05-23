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
	showAlert
} from '../const';


export class Login extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			loading: false,
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
		
		this.setState({ loading: true });
		const { navigateTo, lastPosition } = this.props;
		
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
						marker: this.props.marker ? this.props.marker : null,
						lastPosition
					}
				});
			}
			else
			{
				showAlert('Login failed. Invalid e-mail or password.');
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
			<Button styleName="full-width" onPress={() => this.submitForm()}>
				<Icon name="play" />
				<Text>LOGIN</Text>
			</Button>
		);
	}
	
	render()
	{
		const { navigateTo, lastPosition, returnScreen } = this.props;
		
		return (
			<ScrollView style={{backgroundColor: '#FFF'}}>
				<NavigationBar title="LOGIN" />

				<TextInput
					autoCapitalize="none"
					autoCorrect={false}
					autoFocus
					maxLength={50}
					enablesReturnKeyAutomatically
					returnKeyType="next"
					keyboardType="email-address"
					onChangeText={(value) => this.setState({email: value.trim().toLowerCase()})}
					style={{borderColor: '#CCC', borderWidth: 1, borderRadius: 0, marginLeft: 15, marginRight: 15, marginTop: 10, marginBottom: 10}}
					placeholder="E-mail"
					keyboardAppearance="dark"
				/>
				
				<TextInput
					autoCapitalize="none"
					autoCorrect={false}
					enablesReturnKeyAutomatically
					returnKeyType="next"
					secureTextEntry
					onChangeText={(value) => this.setState({password: value.trim()})}
					style={{borderColor: '#CCC', borderWidth: 1, borderRadius: 0, marginLeft: 15, marginRight: 15, marginTop: 5, marginBottom: 15}}
					placeholder="Password"
					keyboardAppearance="dark"
				/>
				
				<Row style={{marginTop: 0, paddingTop: 0}}>
					{this.renderSubmitButton()}
				</Row>
				
				<Row style={{marginTop: 0, paddingTop: 0, paddingBottom: 300}}>
					<Button styleName="full-width" style={{backgroundColor: '#FAA21B'}} onPress={() => {
						InteractionManager.runAfterInteractions(() => navigateTo({
							screen: ext('Register'),
							props: {
								returnScreen,
								lastPosition,
								marker: this.props.marker ? this.props.marker : null
							}
						}));
					}}>
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