import { writable } from 'svelte/store';

export const ABSMapFilter = writable(0);
export const LensSelected = writable('map');
export const MapBBox = writable({ width: 0, height: 0, x: 0, y: 0 });
export const ABSFilter = writable(undefined);

const MixDefaultValue = 'Ambdos';
export const GenderSelected = writable(MixDefaultValue);
export const Gender = {
  isMix: function(selected) {
    return selected === MixDefaultValue;
  },
  isMan: function(selected) {
    return selected === 'Homes';
  },
  isWoman: function(selected) {
    return selected == 'Dones';
  },
  options: [
    {
      name: MixDefaultValue
    },
    {
      name: 'Homes'
    },
    {
      name: 'Dones'
    }
  ]
};
