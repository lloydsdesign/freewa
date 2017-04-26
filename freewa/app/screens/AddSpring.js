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
	Image,
	TouchableOpacity,
	Title,
	Subtitle,
	Spinner,
	DropDownMenu
} from '@shoutem/ui';

import {
	ScrollView,
	ListView,
	Modal
} from 'react-native';

import { connect } from 'react-redux';
import { ext } from '../extension';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';
const ImagePicker = require('react-native-image-picker');

import {
	jsonGuard,
	CMS_REST,
	MAX_UPLOAD_SIZE,
	parseJSON
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
	
	submitForm()
	{
		const { name, description, type, images } = this.state;
		if(name == '') return;
		
		const { navigateTo, user } = this.props;
		
		this.setState({ uploading: true });
		
		navigator.geolocation.getCurrentPosition((position) => {
				const currPos = position.coords;
				
				var data = new FormData();
				data.append('mobile_add_spring', '');
				data.append('name', name);
				data.append('description', description);
				data.append('type', type.value);
				data.append('user_id', user.id);
				data.append('latitude', currPos.latitude);
				data.append('longitude', currPos.longitude);
				
				featured_image = '';
				if(images.length) featured_image = images[0].name;
				
				data.append('featured_image', featured_image);
				
				var i;
				for(i = 0; i < images.length; i++)
				{
					data.append('img_data[]', images[i].data, images[i].name);
					data.append('img_name[]', images[i].name);
				}
				
				fetch(CMS_REST, {
					headers: new Headers({'Content-Type': 'multipart/form-data'}),
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
							screen: ext('Map'),
							props: { user: user }
						});
					}
				});
			},
			(error) => console.log(JSON.stringify(error)),
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
			allowsEditing: true
		},
		(response) => {
			if(response.didCancel || response.error || response.fileSize > MAX_UPLOAD_SIZE) return;
			var { images } = this.state;
			
			var i;
			for(i = 0; i < images.length; i++)
			{
				if(images[i].uri == response.uri) return;
			}
			
			images[images.length] = {
				name: response.fileName,
				size: response.fileSize,
				uri: response.uri,
				data: response.data
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
		return (
			<TouchableOpacity onPress={() => this.removeImage(image)}>
				<Image styleName="medium-square" source={{ uri: image.uri }} />
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
		
		const { navigateTo, user } = this.props;
		
		var i, size = 0;
		for(i = 0; i < images.length; i++) size += images[i].size;
		
		if(size)
		{
			size /= 1024 * 1024;
			size = size.toFixed(2);
		}
		
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
					<DropDownMenu
						styleName="horizontal"
						options={types}
						selectedOption={type}
						onOptionSelected={(type) => this.setState({ type })}
						titleProperty="title"
						valueProperty="value"
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
				
				{this.renderListView()}
				
				<Divider styleName="line" />
				
				<Row>
					<Button styleName="full-width" onPress={() => this.addImage()}>
						<Icon name="photo" />
						<Text>ADD PHOTO ({images.length} - {size} MB)</Text>
					</Button>
				</Row>
				
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