import React, {
  Component
} from 'react';

import { Dimensions } from 'react-native';
import MapView from 'react-native-maps';
import { Screen } from '@shoutem/ui';
import { NavigationBar } from '@shoutem/ui/navigation';

const jsonGuard = String.fromCharCode(0);
const CMS_URL = 'http://freewa-back.lloyds-design.hr/manage.php';

export default class Map extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			markers: [],
			hasLoaded: false
		};
	}
	
	componentWillMount()
	{
		this.fetchMarkers();
	}
	
	fetchMarkers()
	{
		fetch(CMS_URL, {
			headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'}),
			method: 'POST',
			body: 'get_springs='
		})
		.then((response) => response.text())
		.then((response) => {
			response = parseJSON(response);
			this.setState({ markers: convertToFloat(response.springs) });
		})
		.catch((error) => {
			console.error(error);
		});
	}

	fitToCoordinates()
	{
		const { markers, hasLoaded } = this.state;
		if(hasLoaded || !markers.length) return;
		
		this.refs.map.fitToCoordinates(markers, {
			options:
			{
				edgePadding:
				{
					top: 10,
					right: 10,
					bottom: 10,
					left: 10
				},
				animated: true
			}
		});
		
		this.setState({hasLoaded: true});
	}


	render()
	{
		const { width, height } = Dimensions.get('window');

		return (
		  <Screen styleName="full-screen">
			<NavigationBar
			  styleName="no-border"
			  title="SPRINGS"
			/>
			
			<MapView
				ref="map"
				onRegionChangeComplete={() => this.fitToCoordinates()}
				loadingEnabled
				showsUserLocation
				followsUserLocation
				style={{width: width, height: height}}
			>
				{this.state.markers.map(marker => (
					<MapView.Marker
						coordinate={{
							latitude: marker.latitude,
							longitude: marker.longitude
						}}
						title={marker.title}
					/>
				))}
				
			</MapView>
		  </Screen>
		);
	}
}

function convertToFloat(markers)
{
	var i;
	for(i = 0; i < markers.length; i++)
	{
		markers[i].latitude = parseFloat(markers[i].latitude),
		markers[i].longitude = parseFloat(markers[i].longitude)
	}
	
	return markers;
}

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
