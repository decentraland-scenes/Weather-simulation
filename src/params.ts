//// VALUES TO CONFIGURE ////////

// fakeWeather CONTROLS WHAT WEATHER CONDITION TO SHOW IN THE SCENE
// TRY THE FOLLOWING VALUES:
// `snow`
// `thunder`
// `heavy rain`
// `light rain`
// `cloudy`
export const fakeWeather: string | null = null

//////////////////////////////

// THESE VALUES WILL BE USEFUL WHEN HITTING THE WEATHER API (NOT CURRENTLY SUPPORTED)

//const lat: string = '-34.55'
//const lon: string = '-58.46'

const appId: string = 'bb6063b3'
const APIkey: string = '2e55a43d3e62d76f145f28aa7e3990e9'
const lat: string = '37'
const lon: string = '5'

export const rainSpeed = 4
export const snowSpeed = 1

////////////////////////////////
// CUSTOM TYPES

export const callUrl: string =
  'http://api.weatherunlocked.com/api/current/' +
  lat +
  ',%20' +
  lon +
  '?app_id=' +
  appId +
  '&app_key=' +
  APIkey

