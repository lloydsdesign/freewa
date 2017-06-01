import React, {
	Component
} from 'react';

import {
	ListView,
	Modal,
	Image,
	ScrollView,
	InteractionManager,
	Keyboard,
	KeyboardAvoidingView,
	Platform
} from 'react-native';

import {
	Text,
	Divider,
	Row,
	View,
	TextInput,
	Icon,
	Button,
	TouchableOpacity,
	Title,
	Subtitle,
	Caption,
	Spinner,
	DropDownMenu
} from '@shoutem/ui';

import { connect } from 'react-redux';
import { ext } from '../extension';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';
const ImagePicker = require('react-native-image-picker');

import {
	jsonGuard,
	CMS_REST,
	MAX_UPLOAD_SIZE,
	parseJSON,
	showAlert,
	renderNavLogo
} from '../const';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
const types = [
	{
		title: 'NATURAL',
		value: 'natural'
	},
	{
		title: 'URBAN',
		value: 'urban'
	}
];


export class AddSpring extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			name: '',
			description: '',
			type: types[0],
			images: [],
			uploading: false
		};
	}
	
	componentWillUnmount()
	{
		Keyboard.dismiss();
	}
	
	submitForm()
	{
		Keyboard.dismiss();
		
		const { name, description, type, images } = this.state;
		if(name == '' || !images.length)
		{
			showAlert('Add spring failed. Please fill name field and add at least one image.');
			return;
		}
		
		const { navigateTo, user, lastPosition } = this.props;
		this.setState({ uploading: true });
		
		navigator.geolocation.getCurrentPosition((position) => {
				var currPos = position.coords;
				
				var data = new FormData();
				data.append('mobile_add_spring', '');
				data.append('name', name);
				data.append('description', description);
				data.append('type', type.value);
				data.append('active', '1');
				data.append('user_id', user.id);
				data.append('featured_image', images[0].name);
				
				if('latitude' in images[0] && 'longitude' in images[0] && images[0].latitude && images[0].longitude)
				{
					currPos.latitude = images[0].latitude;
					currPos.longitude = images[0].longitude;
				}
				
				data.append('latitude', currPos.latitude);
				data.append('longitude', currPos.longitude);
				
				var i;
				for(i = 0; i < images.length; i++)
				{
					data.append('img_data[]', images[i].data, images[i].name);
					data.append('img_name[]', images[i].name);
				}
				
				fetch(CMS_REST, {
					method: 'POST',
					body: data
				})
				.then((response) => response.text())
				.then((response) => {
					response = parseJSON(response);
					this.setState({ uploading: false });
					
					if(response.status)
					{
						navigateTo({
							screen: ext('ThankYou'),
							props: { user, lastPosition }
						});
					}
					else showAlert('Add spring failed.');
				});
			},
			(error) => {
				showAlert('Add spring failed. Are your geolocation services turned on?');
				this.setState({ uploading: false });
			},
			{enableHighAccuracy: true}
		);
	}
	
	
	addImage()
	{
		var max_size = MAX_UPLOAD_SIZE / (1024 * 1024);
		max_size = parseFloat(max_size.toFixed(2));
		
		ImagePicker.showImagePicker({
			title: 'ADD PHOTO (max. '+ max_size +' MB each)',
			cameraType: 'back',
			mediaType: 'photo',
			quality: 1,
			allowsEditing: true,
			storageOptions: {
				skipBackup: true,
				cameraRoll: true
			}
		},
		(response) => {
			if(response.didCancel || response.error || response.fileSize > MAX_UPLOAD_SIZE) return;
			var { images } = this.state;
			
			var i, file_name;
			for(i = 0; i < images.length; i++)
			{
				if(images[i].uri == response.uri) return;
			}
			
			if(Platform.OS == 'ios') file_name = 'image'+ images.length +'.jpg';
			else file_name = response.fileName;
			
			images[images.length] = {
				name: file_name,
				size: response.fileSize,
				uri: response.uri,
				data: response.data,
				latitude: response.latitude,
				longitude: response.longitude
			};
			
			this.setState({ images });
		});
	}
	
	removeImage(image)
	{
		var { images } = this.state;
		
		images.splice(images.indexOf(image), 1);
		this.setState({ images });
	}
	
	renderRow(image)
	{
		var size = image.size / (1024 * 1024);
		size = parseFloat(size.toFixed(2));
		
		return (
			<TouchableOpacity onPress={() => this.removeImage(image)}>
				<Image style={{ width: 150, height: 150 }} source={{ uri: image.uri }}>
					<View styleName="overlay vertical v-center h-center fill-parent">
						<Image source={require('../assets/icons/remove.png')} />
						<Caption style={{ color: '#fff' }}>{size} MB</Caption>
					</View>
				</Image>
			</TouchableOpacity>
		);
	}
	
	renderListView()
	{
		const { images } = this.state;
		if(!images.length) return null;
		
		return (
			<ListView
				horizontal
				dataSource={ds.cloneWithRows(images)}
				renderRow={image => this.renderRow(image)}
			/>
		);
	}
	
	renderNavHome()
	{
		const { navigateTo, user, lastPosition } = this.props;
		
		return (
			<View styleName="container" virtual>
				<TouchableOpacity onPress={() => navigateTo({
					screen: ext('Map'),
					props: { user, lastPosition }
				})}>
					<Image style={{ width: 32, height: 32, marginRight: 10 }} source={require('../assets/icons/home.png')} />
				</TouchableOpacity>
			</View>
		);
	}
	
	render()
	{
		const { images, type, uploading } = this.state;
		
		if(uploading)
		{
			return (
				<Modal
					animationType={"fade"}
					visible
					onRequestClose={() => this.setState({ uploading: false })}
				>
					<View style={{ flex: 1 }} styleName="vertical h-center v-center">
						<Title>Uploading</Title>
						<Subtitle>This could take a while...</Subtitle>
						<Spinner style={{ size: 'large' }} />
					</View>
				</Modal>
			);
		}
		
		const { navigateTo, user, lastPosition } = this.props;
		
		var i, size = 0;
		for(i = 0; i < images.length; i++) size += images[i].size;
		
		if(size)
		{
			size /= 1024 * 1024;
			size = parseFloat(size.toFixed(2));
		}
		
		return (
			<ScrollView style={{backgroundColor: '#FFF'}}>
				<NavigationBar
					renderLeftComponent={() => renderNavLogo()}
					renderRightComponent={() => this.renderNavHome()}
				/>

				<KeyboardAvoidingView>
					<TextInput
						autoCapitalize="words"
						autoCorrect={false}
						autoFocus
						maxLength={50}
						enablesReturnKeyAutomatically
						returnKeyType="next"
						onChangeText={(value) => this.setState({name: value.trim()})}
						style={{borderColor: '#CCC', borderWidth: 1, borderRadius: 0, margin: 15}}
						placeholder="Name of the New Spring"
						keyboardAppearance="dark"
						underlineColorAndroid="#fff"
					/>
					
					<Divider styleName="line" />
					
					<Subtitle styleName="horizontal h-center v-center" style={{padding: 10}}>SPRING TYPE</Subtitle>
					<DropDownMenu
						style={{backgroundColor: '#ddd'}}
						options={types}
						selectedOption={type}
						onOptionSelected={(type) => this.setState({ type })}
						titleProperty="title"
						valueProperty="value"
					/>
					
					<Divider styleName="line" />
					
					<TextInput
						autoCapitalize="sentences"
						autoCorrect={false}
						enablesReturnKeyAutomatically
						returnKeyType="next"
						multiline
						maxLength={500}
						onChangeText={(value) => this.setState({description: value.trim()})}
						style={{height: 240, textAlignVertical: 'top', borderColor: '#CCC', borderWidth: 1, borderRadius: 0, margin: 15}}
						placeholder="Spring Description"
						keyboardAppearance="dark"
						underlineColorAndroid="#fff"
					/>
				</KeyboardAvoidingView>
				
				<Divider styleName="line" />
				
				{this.renderListView()}
				
				<Divider styleName="line" />
				
				<Row>
					<Button styleName="full-width" onPress={() => this.addImage()}>
						<Icon name="photo" />
						<Text>ADD PHOTO ({images.length} - {size} MB)</Text>
					</Button>
				</Row>
				
				<View styleName="horizontal" style={{marginBottom: 250}}>
					<Button styleName="full-width" style={{marginRight: 5, marginLeft: 15}} onPress={() => {
						InteractionManager.runAfterInteractions(() => navigateTo({
							screen: ext('Map'),
							props: { user, lastPosition }
						}));
					}}>
						<Icon name="close" />
						<Text>CANCEL</Text>
					</Button>
					
					<Button styleName="full-width" style={{backgroundColor: '#FAA21B', marginRight: 15, marginLeft: 5}} onPress={() => {
						InteractionManager.runAfterInteractions(() => this.submitForm());
					}}>
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