// This file is managed by Shoutem CLI
// You should not change it
import pack from './package.json';

// screens imports
import Map from './screens/Map';
import SpringDetails from './screens/SpringDetails';
import Login from './screens/Login';
import Register from './screens/Register';
import AddSpring from './screens/AddSpring';
import RateSpring from './screens/RateSpring';
import ThankYou from './screens/ThankYou';

// themes imports


export const screens = {
  Map,
  SpringDetails,
  Login,
  Register,
  AddSpring,
  RateSpring,
  ThankYou
};

export const themes = {

};

export function ext(resourceName) {
  return resourceName ? `${pack.name}.${resourceName}` : pack.name;
}
