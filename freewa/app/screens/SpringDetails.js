import React, {
  Component
} from 'react';

import {
  ScrollView
} from 'react-native';

import {
  Row,
  Subtitle,
  Text,
  Title,
  View,
  Image,
  Tile,
  Divider
} from '@shoutem/ui';

import { InlineMap } from '@shoutem/ui-addons';
import { NavigationBar } from '@shoutem/ui/navigation';


export default class SpringDetails extends Component
{
	render()
	{
		const { marker } = this.props;
		
		const position = {
			latitude: marker.latitude,
			longitude: marker.longitude,
			title: marker.title.toUpperCase()
		};
		  
		return (
			<ScrollView style={{marginTop: -1}}>
				<NavigationBar title={marker.title.toUpperCase()} />
				
				<Image styleName="large-banner" source={{ uri: marker.image }}>
					<Tile>
						<Title>{marker.title.toUpperCase()}</Title>
						<Subtitle>{marker.type.toUpperCase()}</Subtitle>
					</Tile>
				</Image>

				<Divider styleName="line" />

				<Row>
					<View style={{flex: 1}}>
					  <Subtitle>SPRING DESCRIPTION</Subtitle>
					  <Text />
					  <Text>{marker.description}</Text>
					</View>
				</Row>

				<View styleName="large-banner">
					<InlineMap
						initialRegion={{
							latitude: position.latitude,
							longitude: position.longitude,
							latitudeDelta: 0.03,
							longitudeDelta: 0.03
						}}
						markers={[position]}
						selectedMarker={position}
						style={{height: 160}}
					/>
				</View>
			</ScrollView>
		);
	}
}
