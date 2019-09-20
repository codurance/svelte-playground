import { writable } from 'svelte/store';

export const ABSChartFilter = writable(0);
export const ABSFilter = writable(undefined);

export function getAbsCode(feature) {
  return feature && feature.properties.NOMABS.replace('Barcelona - ', '');
}

export function isMatchABS(feature, absFilter) {
  return (
    feature &&
    (!absFilter ||
      feature.properties.NOMSS.toLowerCase().includes(
        absFilter.toLowerCase()
      ) ||
      getAbsCode(feature)
        .toLowerCase()
        .includes(absFilter.toLowerCase()))
  );
}

export function filterABS(features, absFilter) {
  return absFilter && features
    ? features.filter(f => isMatchABS(f, absFilter))
    : features;
}
