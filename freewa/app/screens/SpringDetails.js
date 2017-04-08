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
  Icon,
  Button,
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
				
				<Row style={{backgroundColor: 'rgba(0,178,193,0.7)', marginTop: -47}}>
					<Text style={{color: '#FFF', fontWeight: 'bold', textAlign: 'center'}}>150m FROM YOU</Text>
				</Row>
				
				<Row style={{backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: {width: 0, height: -3}}}>
					<View style={{flex: 0.4}}>
						<Text style={{color: '#00B2C1', textAlign: 'center'}}>TYPE</Text> 
						<Text style={{textAlign: 'center'}}>{marker.type.toUpperCase()}</Text>
					</View>
					
					<View style={{flex: 0.6}}>
						<Text style={{color: '#00B2C1', textAlign: 'center'}}>CONTRIBUTOR</Text> 
						<Text style={{textAlign: 'center'}}>{marker.user}</Text>
					</View>
				</Row>
				
				<Divider styleName="line" />
				
				<Row style={{backgroundColor: '#00B2C1'}}>
					<View style={{flex: 0.4, backgroundColor: '#00B2C1'}}>
						<Text style={{color: '#FFF', textAlign: 'center'}}>RATING</Text> 
					</View>
					
					<View style={{flex: 0.2, backgroundColor: '#FFF'}}>
						<Text style={{color: '#00B2C1', textAlign: 'center', fontSize: 30, fontWeight: 'bold'}}>4.6</Text> 
					</View>
					<View style={{flex: 0.4, backgroundColor: '#00B2C1'}}>
						<Text style={{color: '#FFF', textAlign: 'center', fontWeight: 'bold'}}>SUPERB</Text> 
					</View>
				</Row>
				
				<Divider styleName="line" />
				
				<Row>
					<View style={{flex: 1}}>
						<Text style={{color: '#00B2C1'}}>SPRING DESCRIPTION</Text>
						<Text />
						<Text style={{fontSize: 13}}>{marker.description}</Text>
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
							<Text>POSITION:</Text>
							<Text style={{fontWeight: 'bold'}}>N: {position.latitude.toFixed(6)}    E: {position.longitude.toFixed(6)}</Text>
							<Text> </Text>
						</View>
					</InlineMap>
				</View>
				<Row>
					<Button styleName="full-width" style={{backgroundColor: '#FAA21B', marginTop: -80}}>
						<Icon name="pin" />
						<Text>O P E N   C O M P A S S</Text>
					</Button>
				</Row>
				
			</ScrollView>
		);
	}
}
