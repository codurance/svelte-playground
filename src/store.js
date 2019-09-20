import { writable } from 'svelte/store';

export const ABSChartFilter = writable(0);
export const LensSelected = writable('map');
export const ABSFilter = writable(undefined);

const MixDefaultValue = 'Ambdós';
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
export const ColorGender = {
  Mix: ['#ffffff', '#ffd333', '#ffde66', '#fff4cc', '#ffe999'],
  Woman: ['#ffffff', '#f7b2d5', '#db74a9', '#b5417d', '#ff69b4'],
  Man: ['#ffffff', '#6fd1f2', '#12c4ff', '#089dcf', '#00769e']
};
