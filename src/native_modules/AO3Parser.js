import { NativeModules } from 'react-native'

const { RNAO3Scraper } = NativeModules;

//native modules export keys/name
const NM_KEYS = {
  getWorksFromURL: 'getWorksFromURL',
};

export default {
  AO3Scraper: RNAO3Scraper,

  async getWorksFromURL(url = "") {
    try {
      const jsonStr = await RNAO3Scraper[NM_KEYS.getWorksFromURL](url);
      const json = JSON.parse(jsonStr);
      return json;
      
    } catch(error){
      console.log(`Unable to retrieve webpage: ${url}`);
      console.log(error);
      return null;
    };
  },
};