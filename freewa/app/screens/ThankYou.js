import React, {
	Component
} from 'react';

import { Keyboard } from 'react-native';

import {
	Text,
	Row,
	Icon,
	Button,
	View,
	Screen,
	Subtitle
} from '@shoutem/ui';

import { connect } from 'react-redux';
import { ext } from '../extension';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';


export class ThankYou extends Component
{
	componentDidMount()
	{
		Keyboard.dismiss();
	}
	
	render()
	{
		const { navigateTo, lastPosition, user } = this.props;
		
		return (
			<Screen>
				<NavigationBar
					title="THANK YOU"
					renderLeftComponent={() => { return null; }}
				/>
				
				<View styleName="vertical h-center">
					<Row>
						<Subtitle>Thank you {user.fullName} for contributing to our community.</Subtitle>
					</Row>
				</View>
				
				<Row>
					<Button styleName="full-width" onPress={() => navigateTo({
						screen: ext('Map'),
						props: { user, lastPosition }
					})}>
						<Icon name="pin" />
						<Text>BACK TO MAP</Text>
					</Button>
				</Row>
			</Screen>
		);
	}
}

export default connect(
	undefined,
	{ navigateTo }
)(ThankYou);