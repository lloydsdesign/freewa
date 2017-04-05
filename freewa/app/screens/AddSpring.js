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

export class AddSpring extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			name: '',
			description: ''
		};
	}
	
	submitForm()
	{
		const {name, description} = this.state;
		if(name == '') return;
		
		const { navigateTo, user } = this.props;
		const type = 'natural';
		
		/*navigator.geolocation.getCurrentPosition((position) => {
				currPos = position.coords;
			},
			(error) => console.log(JSON.stringify(error)),
			{enableHighAccuracy: true}
		);*/
		
		const currPos = {
			latitude: 45.324995,
			longitude: 14.451417
		};
		
		fetch(CMS_REST, {
			headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'}),
			method: 'POST',
			body: 'mobile_add_spring=&name='+ name +'&description='+ description +'&type='+ type +'&user_id='+ user.id +'&latitude='+ currPos.latitude +'&longitude='+ currPos.longitude
		})
		.then((response) => response.text())
		.then((response) => {
			response = parseJSON(response);
			
			if(response.status)
			{
				navigateTo({
					screen: ext('Map'),
					props: { user: user }
				});
			}
		})
		.catch((error) => {
			console.error(error);
		});
	}
	
	render()
	{
		const { navigateTo } = this.props;
		
		return (
			<ScrollView style={{marginTop: -1}}>
				<NavigationBar title="LOGIN" />

				<Row>
					<Subtitle>Name</Subtitle>
					<TextInput
						autoCapitalize="words"
						autoCorrect={false}
						autoFocus
						maxLength={50}
						enablesReturnKeyAutomatically
						returnKeyType="next"
						onChangeText={(value) => this.setState({name: value.trim()})}
					/>
				</Row>
				
				<Divider styleName="line" />
				
				<Row>
					<Subtitle>Description</Subtitle>
					<TextInput
						autoCapitalize="sentences"
						autoCorrect={false}
						enablesReturnKeyAutomatically
						returnKeyType="next"
						multiline
						maxLength={500}
						onChangeText={(value) => this.setState({description: value.trim()})}
					/>
				</Row>
				
				<Divider styleName="line" />
				
				<Row>
					<Button styleName="full-width" onPress={() => this.submitForm()}>
						<Icon name="right-arrow" />
						<Text>SAVE</Text>
					</Button>
				</Row>
			</ScrollView>
		);
	}
}

export default connect(
	undefined,
	{ navigateTo }
)(AddSpring);

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