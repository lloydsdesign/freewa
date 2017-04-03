// This file is managed by Shoutem CLI
// You should not change it
import pack from './package.json';
import Map from './screens/Map';
import SpringDetails from './screens/SpringDetails';

export const screens = {
  Map,
  SpringDetails
};

export function ext(resourceName) {
  return resourceName ? `${pack.name}.${resourceName}` : pack.name;
}
