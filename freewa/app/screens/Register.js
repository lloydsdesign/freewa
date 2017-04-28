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


export class Register extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
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
		
		const { navigateTo } = this.props;
		
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
				navigateTo({
					screen: this.props.returnScreen,
					props: {
						user: response.data,
						marker: this.props.marker ? this.props.marker : null
					}
				});
			}
			else showAlert('Registration failed.');
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
					<Image style={{ width: 32, height: 32 }} source={require('../assets/icons/home.png')} />
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
					renderLeftComponent={() => { return null }}
					renderTitleComponent={() => renderNavLogo()}
					renderRightComponent={() => this.renderNavHome()}
				/>
				
				<Row style={{marginTop: 0, paddingTop: 10}}>
					<View styleName="horizontal h-center">
						<Title>REGISTER</Title>
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
						onChangeText={(value) => this.setState({username: value.trim()})}
						style={{flex: 1, borderColor: '#CCC', borderWidth: 1, borderRadius: 4}}
						placeholder="Username"
					/>
				</Row>
				
				<Row style={{marginTop: 0, paddingTop: 0}}>
					<TextInput
						autoCapitalize="words"
						autoCorrect={false}
						maxLength={50}
						enablesReturnKeyAutomatically
						returnKeyType="next"
						onChangeText={(value) => this.setState({fullName: value.trim()})}
						style={{flex: 1, borderColor: '#CCC', borderWidth: 1, borderRadius: 4}}
						placeholder="Full Name"
					/>
				</Row>
				
				<Row style={{marginTop: 0, paddingTop: 0}}>
					<TextInput
						autoCapitalize="none"
						autoCorrect={false}
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
				
				<View styleName="horizontal" style={{backgroundColor: '#FFF'}}>
					<Button styleName="full-width" style={{marginRight: 5, marginLeft: 15}}onPress={() => navigateTo({
						screen: ext('Map')
					})}>
						<Icon name="close" />
						<Text>CANCEL</Text>
					</Button>
					
					<Button styleName="full-width"  style={{backgroundColor: '#FAA21B', marginRight: 15, marginLeft: 5}} onPress={() => this.submitForm()}>
						<Icon name="add-friend" />
						<Text>REGISTER</Text>
					</Button>
				</View>
			</ScrollView>
		);
	}
}

export default connect(
	undefined,
	{ navigateTo }
)(Register);