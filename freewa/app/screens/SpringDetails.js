import React, {
	Component
} from 'react';

import {
	ScrollView,
	Keyboard,
	InteractionManager,
	Linking,
	Platform
} from 'react-native';

import {
	Row,
	Text,
	Icon,
	Button,
	View,
	Image,
	ListView,
	TouchableOpacity,
	Spinner,
	Divider
} from '@shoutem/ui';

import { connect } from 'react-redux';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';
import { ext } from '../extension';

import {
	fullStar,
	emptyStar,
	CMS_REST,
	DISCLAIMER_URL,
	getRatingString,
	parseJSON,
	showAlert
} from '../const';


export class SpringDetails extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			comments: [],
			loading: false
		};
	}
	
	componentDidMount()
	{
		Keyboard.dismiss();
	}
	
	renderRating()
	{
		const { marker } = this.props;
		
		if(!marker.ratingCount)
		{
			return (
				<Row style={{backgroundColor: '#00B2C1'}}>
					<View style={{flex: 1, backgroundColor: '#00B2C1'}}>
						<Text style={{color: '#FFF', textAlign: 'center'}}>UNRATED</Text>
					</View>
				</Row>
			);
		}
		
		return (
			<Row style={{backgroundColor: '#00B2C1'}}>
				<View style={{flex: 0.4, backgroundColor: '#00B2C1'}}>
					<Text style={{color: '#FFF', textAlign: 'center'}}>RATING</Text>
				</View>
				<View style={{flex: 0.2, backgroundColor: '#FFF'}}>
					<Text style={{color: '#00B2C1', textAlign: 'center', fontSize: 30, fontWeight: 'bold'}}>{marker.rating}</Text>
				</View>
				<View style={{flex: 0.4, backgroundColor: '#00B2C1'}}>
					<Text style={{color: '#FFF', textAlign: 'center', fontWeight: 'bold'}}>{getRatingString(marker.rating)}</Text>
				</View>
			</Row>
		);
	}
	
	renderLogin()
	{
		const { user, marker, navigateTo, lastPosition } = this.props;
		
		if(user)
		{
			return (
				<Button style={{margin: 10, padding: 10, backgroundColor: '#FAA21B', borderColor: '#FFF'}} onPress={() => {
					InteractionManager.runAfterInteractions(() => navigateTo({
						screen: ext('RateSpring'),
						props: {
							marker,
							user,
							lastPosition
						}
					}));
				}}>
					<Icon name="add-to-favorites-on" />
					<Text>RATE</Text>
				</Button>
			);
		}
		
		return (
			<Button style={{margin: 10, padding: 10, backgroundColor: '#FAA21B', borderColor: '#FFF'}} onPress={() => {
				InteractionManager.runAfterInteractions(() => navigateTo({
					screen: ext('Login'),
					props: {
						marker,
						returnScreen: ext('RateSpring'),
						lastPosition
					}
				}));
			}}>
				<Icon name="add-to-favorites-on" />
				<Text>LOGIN TO RATE</Text>
			</Button>
		);
	}
	
	renderComments()
	{
		const { comments, loading } = this.state;
		
		if(loading)
		{
			return (
				<Row>
					<View styleName="horizontal v-center h-center" style={{ flex: 1 }}>
						<Spinner style={{ size: 'large', color: '#00B2C1' }} />
					</View>
				</Row>
			);
		}
		
		if(!comments.length)
		{
			return (
				<Row>
					<Button styleName="full-width" onPress={() => this.fetchComments()}>
						<Icon name="comment" />
						<Text>VIEW LATEST COMMENTS</Text>
					</Button>
				</Row>
			);
		}
		
		return (
			<View style={{margin: 15}}>
				<ListView
					data={comments}
					renderRow={comment => this.renderRowComment(comment)}
				/>

				<Button styleName="full-width" onPress={() => this.setState({ comments: [] })}>	
					<Icon name="up-arrow" />
					<Text>CLOSE</Text>
				</Button>
			</View>
		);
	}
	
	fetchComments()
	{
		this.setState({ loading: true });
		const { marker } = this.props;
		
		var data = new FormData();
		data.append('get_comments', '');
		data.append('spring_id', marker.id);
		data.append('limit', '10');
		
		fetch(CMS_REST, {
			method: 'POST',
			body: data
		})
		.then((response) => response.text())
		.then((response) => {
			response = parseJSON(response);
			if(!response.comments.length) showAlert('This spring has no comments yet.');
			
			this.setState({ comments: response.comments, loading: false })
		});
	}
	
	renderDescription()
	{
		const { marker } = this.props;
		if(marker.description == "") return null;
		
		return (
			<Row>
				<View style={{flex: 1}}>
					<Text style={{color: '#00B2C1'}}>SPRING DESCRIPTION</Text>
					<Text />
					<Text style={{fontSize: 13}}>{marker.description}</Text>
				</View>
			</Row>
		);
	}
	
	openMaps()
	{
		const { marker } = this.props;
		var url;
		
		if(Platform.OS == 'ios') url = 'http://maps.apple.com/?daddr='+ marker.latitude +','+ marker.longitude +'&dirflg=w';
		else url = 'google.navigation:q='+ marker.latitude +','+ marker.longitude +'&mode=w';
		
		Linking.openURL(url);
	}
	
	renderRow(image)
	{
		return (
			<Image styleName="featured" source={{ uri: image }} />
		);
	}
	
	renderRowComment(comment)
	{
		return (
			<View style={{backgroundColor: '#f7f7f7'}}>
				<View styleName="vertical" style={{padding: 15}}>
					<Text style={{color: '#00B2C1', fontWeight: 'bold', fontSize: 12}}>Rated {comment.rate}/5 by {comment.user} on {comment.timestamp}</Text>
					<Text>{comment.message}</Text>
				</View>	
			
				<Divider styleName="line" />
			</View>
		);
	}

	render()
	{
		const { marker } = this.props;
		  
		return (
			<ScrollView>
				<NavigationBar title={marker.title.toUpperCase()} />
				
				<ListView
					horizontal
					data={marker.images}
					renderRow={image => this.renderRow(image)}
				/>
				
				<Row style={{backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: {width: 0, height: -3}}}>
					<View style={{flex: 0.4}} styleName="vertical h-center v-center">
						<Text style={{color: '#00B2C1'}}>TYPE</Text>
						<Text>{marker.type.toUpperCase()}</Text>
					</View>
					
					<View style={{flex: 0.6}} styleName="vertical h-center v-center">
						<Text style={{color: '#00B2C1'}}>CONTRIBUTOR</Text>
						<Text>{marker.user}</Text>
					</View>
				</Row>
				
				{this.renderRating()}
				{this.renderLogin()}
				{this.renderComments()}
				{this.renderDescription()}
				
				<Row>
					<TouchableOpacity onPress={() => Linking.openURL(DISCLAIMER_URL)}>
						<Text style={{textDecorationLine: 'underline', textAlign: 'center', color: '#00B2C1', fontSize: 12}}>READ DISCLAIMER BEFORE USING SPRING</Text>
					</TouchableOpacity>
				</Row>
				
				<Divider styleName="line" />
				
				<Row style={{backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: {width: 0, height: -3}}}>
					<View style={{flex: 0.5}} styleName="vertical h-center v-center">
						<Text style={{color: '#00B2C1'}}>LATITUDE</Text>
						<Text>{marker.latitude.toFixed(6)}</Text>
					</View>
					
					<View style={{flex: 0.5}} styleName="vertical h-center v-center">
						<Text style={{color: '#00B2C1'}}>LONGITUDE</Text>
						<Text>{marker.longitude.toFixed(6)}</Text>
					</View>
				</Row>
				
				<Row>
					<Button styleName="full-width" style={{backgroundColor: '#00B2C1'}} onPress={() => this.openMaps()}>
						<Image style={{width: 16, height:16, marginRight: 10}} source={require('../assets/icons/compass.png')} />
						<Text>SHOW DIRECTIONS</Text>
					</Button>
				</Row>
			</ScrollView>
		);
	}
}

export default connect(
	undefined,
	{ navigateTo }
)(SpringDetails);