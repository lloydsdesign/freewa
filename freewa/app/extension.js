// This file is managed by Shoutem CLI
// You should not change it
import pack from './package.json';
import Map from './screens/Map';

export const screens = {
  Map
};

export function ext(resourceName) {
  return resourceName ? `${pack.name}.${resourceName}` : pack.name;
}
