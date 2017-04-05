import React, {
  Component
} from 'react';

import {
  Text,
  Divider,
  Row,
  TextInput,
  Icon,
  Button,
  Subtitle
} from '@shoutem/ui';

import { ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { ext } from '../extension';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';

const jsonGuard = String.fromCharCode(0);
const CMS_BASE = 'http://freewa-back.lloyds-design.hr/';
const CMS_REST = CMS_BASE +'manage.php';

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
		if(username == '' || password == '' || fullName == '' || email == '') return;
		
		const { navigateTo } = this.props;
		
		fetch(CMS_REST, {
			headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'}),
			method: 'POST',
			body: 'mobile_add_admin=&username='+ username +'&password='+ password +'&full_name='+ fullName +'&email='+ email
		})
		.then((response) => response.text())
		.then((response) => {
			response = parseJSON(response);
			
			if(response.status)
			{
				navigateTo({
					screen: this.props.returnScreen,
					props: { user: response.data }
				});
			}
		})
		.catch((error) => {
			console.error(error);
		});
	}
	
	render()
	{
		return (
			<ScrollView style={{marginTop: -1}}>
				<NavigationBar title="REGISTER" />

				<Row>
					<Subtitle>Username</Subtitle>
					<TextInput
						autoCapitalize="none"
						autoCorrect={false}
						autoFocus
						maxLength={50}
						enablesReturnKeyAutomatically
						returnKeyType="next"
						onChangeText={(value) => this.setState({username: value.trim()})}
					/>
				</Row>
				
				<Divider styleName="line" />
				
				<Row>
					<Subtitle>Full name</Subtitle>
					<TextInput
						autoCapitalize="words"
						autoCorrect={false}
						maxLength={50}
						enablesReturnKeyAutomatically
						returnKeyType="next"
						onChangeText={(value) => this.setState({fullName: value.trim()})}
					/>
				</Row>
				
				<Divider styleName="line" />
				
				<Row>
					<Subtitle>E-mail</Subtitle>
					<TextInput
						autoCapitalize="none"
						autoCorrect={false}
						maxLength={50}
						enablesReturnKeyAutomatically
						returnKeyType="next"
						keyboardType="email-address"
						onChangeText={(value) => this.setState({email: value.trim().toLowerCase()})}
					/>
				</Row>
				
				<Divider styleName="line" />
				
				<Row>
					<Subtitle>Password</Subtitle>
					<TextInput
						autoCapitalize="none"
						autoCorrect={false}
						enablesReturnKeyAutomatically
						returnKeyType="next"
						secureTextEntry
						onChangeText={(value) => this.setState({password: value.trim()})}
					/>
				</Row>
				
				<Divider styleName="line" />
				
				<Row>
					<Button styleName="full-width" onPress={() => this.submitForm()}>
						<Icon name="right-arrow" />
						<Text>REGISTER</Text>
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

function parseJSON(value)
{
	const startPos = value.indexOf(jsonGuard);
	const endPos = value.lastIndexOf(jsonGuard);
	if(startPos > -1 && endPos > startPos) value = value.substring(startPos + jsonGuard.length, endPos);
	
	try
	{
		value = JSON.parse(value);
	}
	catch(SyntaxError)
	{
		return false;
	}
	
	return value;
}