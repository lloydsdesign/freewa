import React, {
  Component
} from 'react';

import {
  ScrollView,
  ListView
} from 'react-native';

import {
  Row,
  Subtitle,
  Text,
  Title,
  View,
  Image,
  Divider
} from '@shoutem/ui';

import { InlineMap } from '@shoutem/ui-addons';
import { NavigationBar } from '@shoutem/ui/navigation';

export default class SpringDetails extends Component
{
	renderRow(image)
	{
		return (
			<Image styleName="large-banner" source={{ uri: image }} />
		);
	}

	render()
	{
		const { marker } = this.props;
		const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
		
		const position = {
			latitude: marker.latitude,
			longitude: marker.longitude,
			title: marker.title.toUpperCase()
		};
		  
		return (
			<ScrollView style={{marginTop: -1}}>
				<NavigationBar title={marker.title.toUpperCase()} />
				
				<ListView
					horizontal
					dataSource={ds.cloneWithRows(marker.images)}
					renderRow={image => this.renderRow(image)}
					enableEmptySections
				/>
				
				<Divider styleName="line" />
				
				<Row>
					<Title>{marker.title.toUpperCase()}</Title>
					<Subtitle>{marker.type.toUpperCase()}</Subtitle>
					<Text>by {marker.user}</Text>
				</Row>

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
							latitudeDelta: 0.3,
							longitudeDelta: 0.3
						}}
						markers={[position]}
						selectedMarker={position}
						style={{height: 160}}
					>
						<View styleName="overlay vertical v-center h-center fill-parent">
							<Text>N: {position.latitude.toFixed(6)}</Text>
							<Text>E: {position.longitude.toFixed(6)}</Text>
						</View>
					</InlineMap>
				</View>
			</ScrollView>
		);
	}
}
