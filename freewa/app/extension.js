// This file is managed by Shoutem CLI
// You should not change it
import pack from './package.json';
import Map from './screens/Map';
import SpringDetails from './screens/SpringDetails';
import Login from './screens/Login';
import Register from './screens/Register';
import AddSpring from './screens/AddSpring';

export const screens = {
  Map,
  SpringDetails,
  Login,
  Register,
  AddSpring
};

export function ext(resourceName) {
  return resourceName ? `${pack.name}.${resourceName}` : pack.name;
}
