const fs = require('fs-extra');

const androidManifestPath = 'android/app/src/main/AndroidManifest.xml';
var androidManifest = fs.readFileSync(androidManifestPath, 'utf8');

const locationPermission = '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />';
const networkPermission = '<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />';
const cameraPermission = '<uses-permission android:name="android.permission.CAMERA" />';
const storagePermission = '<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />';

var replacementTag = '<uses-permission android:name="android.permission.INTERNET" />';
var replacement = `
	${locationPermission}
	${networkPermission}
	${cameraPermission}
	${storagePermission}
	${replacementTag}
`;

androidManifest = androidManifest.replace(replacementTag, replacement);

console.log('[freewa] - Adding required permissions to AndroidManifest.xml');
fs.writeFileSync(androidManifestPath, androidManifest, 'ascii');


const buildGradlePath = 'android/app/build.gradle';
var buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

var buildGradleChange = 'javaMaxHeapSize "4g"';
replacementTag = 'jumboMode = true';
replacement = `
	${replacementTag}
	${buildGradleChange}
`;

buildGradle = buildGradle.replace(replacementTag, replacement);

buildGradleChange = 'com.shoutemapp';
replacement = 'hr.apps.n7301';

buildGradle = buildGradle.replace(buildGradleChange, replacement);

console.log('[freewa] - Adding required changes to build.gradle');
fs.writeFileSync(buildGradlePath, buildGradle, 'ascii');