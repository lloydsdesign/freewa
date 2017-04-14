import React, {
  Component
} from 'react';

import {
  Text,
  Divider,
  Row,
  View,
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

import {
	jsonGuard,
	CMS_BASE,
	CMS_REST,
	parseJSON
} from '../const';


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
		const { navigateTo, user } = this.props;
		
		return (
			<ScrollView style={{marginTop: -1, backgroundColor: '#FFF'}}>
				<NavigationBar title="ADD SPRING" />

				<Row style={{marginTop: 0, paddingTop: 10}}>
					<TextInput
						autoCapitalize="words"
						autoCorrect={false}
						autoFocus
						maxLength={50}
						enablesReturnKeyAutomatically
						returnKeyType="next"
						onChangeText={(value) => this.setState({name: value.trim()})}
						style={{flex: 1, borderColor: '#CCC', borderWidth: 1, borderRadius: 4}}
						placeholder="Name of the New Spring"
					/>
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
						onChangeText={(value) => this.setState({description: value.trim()})}
						style={{flex: 1, height: 240, textAlignVertical: 'top', borderColor: '#CCC', borderWidth: 1, borderRadius: 4}}
						placeholder="Spring Description"
					/>
				</Row>
				
				<Divider styleName="line" />
				
				<View styleName="horizontal">
					<Button styleName="full-width" style={{marginRight: 5, marginLeft: 15}} onPress={() => navigateTo({
						screen: ext('Map'),
						props: { user: user }
					})}>
						<Icon name="close" />
						<Text>CANCEL</Text>
					</Button>
					
					<Button styleName="full-width" style={{backgroundColor: '#FAA21B', marginRight: 15, marginLeft: 5}} onPress={() => this.submitForm()}>
						<Icon name="add-to-favorites-full" />
						<Text>SAVE</Text>
					</Button>
				</View>
			</ScrollView>
		);
	}
}

export default connect(
	undefined,
	{ navigateTo }
)(AddSpring);