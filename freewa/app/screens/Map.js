import React, {
  Component
} from 'react';

import {
	Screen,
	Image,
	Tile,
	Title,
	Subtitle
} from '@shoutem/ui';

import { connect } from 'react-redux';
import { Dimensions } from 'react-native';
import MapView from 'react-native-maps';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';
import { ext } from '../extension';

const jsonGuard = String.fromCharCode(0);
const CMS_BASE = 'http://freewa-back.lloyds-design.hr/';
const CMS_REST = CMS_BASE +'manage.php';

export class Map extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			markers: [],
			path: [],
			hasLoaded: false
		};
	}
	
	componentWillMount()
	{
		this.fetchMarkers();
	}
	
	fetchMarkers()
	{
		fetch(CMS_REST, {
			headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'}),
			method: 'POST',
			body: 'get_springs='
		})
		.then((response) => response.text())
		.then((response) => {
			response = parseJSON(response);
			this.setState({ markers: adjustMarkerValues(response.springs) });
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
	
	markerPress(marker)
	{
		/*navigator.geolocation.getCurrentPosition((position) => {
				this.setState({
					path: [position.coords, marker.coordinate]
				});
			},
			(error) => console.log(JSON.stringify(error)),
			{enableHighAccuracy: true}
		);*/
		
		const currPos = {
			latitude: 45.324995,
			longitude: 14.451417
		};
		
		this.setState({
			path: [currPos, marker.coordinate]
		});
	}


	render()
	{
		const { navigateTo } = this.props;
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
				{this.state.markers.map((marker, i) => (
					<MapView.Marker
						key={i}
						coordinate={{
							latitude: marker.latitude,
							longitude: marker.longitude
						}}
						title={marker.title}
						onPress={(e) => this.markerPress(e.nativeEvent)}
					>
						<MapView.Callout
							style={{width: 160, height: 160}}
							onPress={() => navigateTo({
								screen: ext('SpringDetails'),
								props: { marker }
							})}
						>
							<Image styleName="medium-square rounded-corners" source={{ uri: marker.image }}>
								<Tile>
									<Title>{marker.title}</Title>
									<Subtitle>{marker.type}</Subtitle>
								</Tile>
							</Image>
						</MapView.Callout>
					</MapView.Marker>
				))}
				
				<MapView.Polyline
					coordinates={this.state.path}
					geodesic
					strokeColor="#f00"
					strokeWidth={3}
				/>
				
			</MapView>
		  </Screen>
		);
	}
}

export default connect(
	undefined,
	{ navigateTo }
)(Map);

function adjustMarkerValues(markers)
{
	var i;
	for(i = 0; i < markers.length; i++)
	{
		markers[i].latitude = parseFloat(markers[i].latitude);
		markers[i].longitude = parseFloat(markers[i].longitude);
		
		if(markers[i].image && markers[i].image != "") markers[i].image = CMS_BASE + markers[i].image;
		else markers[i].image = undefined;
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
