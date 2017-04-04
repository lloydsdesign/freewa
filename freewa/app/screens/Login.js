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
  Screen,
  Subtitle
} from '@shoutem/ui';

import { connect } from 'react-redux';
import { ext } from '../extension';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';

const jsonGuard = String.fromCharCode(0);
const CMS_BASE = 'http://freewa-back.lloyds-design.hr/';
const CMS_REST = CMS_BASE +'manage.php';

export class Login extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			username: '',
			password: ''
		};
	}
	
	submitForm()
	{
		const {username, password} = this.state;
		if(username == '' || password == '') return;
		
		fetch(CMS_REST, {
			headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'}),
			method: 'POST',
			body: 'mobile_login=&username='+ username +'&password='+ password
		})
		.then((response) => response.text())
		.then((response) => {
			response = parseJSON(response);
			
			if(response.status)
			{
				navigateTo({
					screen: ext('Map'),
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
			<Screen style={{marginTop: -1}}>
				<NavigationBar title="LOGIN" />

				<Row>
					<Subtitle>Username</Subtitle>
					<TextInput
						autoCapitalize="none"
						autoCorrect={false}
						autoFocus
						maxLength={50}
						enablesReturnKeyAutomatically
						onChangeText={(value) => this.setState({username: value.trim()})}
					/>
				</Row>
				
				<Divider styleName="line" />
				
				<Row>
					<Subtitle>Password</Subtitle>
					<TextInput
						autoCapitalize="none"
						autoCorrect={false}
						enablesReturnKeyAutomatically
						secureTextEntry
						onChangeText={(value) => this.setState({password: value.trim()})}
					/>
				</Row>
				
				<Divider styleName="line" />
				
				<Row>
					<Button styleName="full-width" onPress={() => this.submitForm()}>
						<Icon name="right-arrow" />
						<Text>LOGIN</Text>
					</Button>
				</Row>
			</Screen>
		);
	}
}

export default connect(
	undefined,
	{ navigateTo }
)(Login);

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