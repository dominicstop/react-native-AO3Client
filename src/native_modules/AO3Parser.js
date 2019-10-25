import { NativeModules } from 'react-native'

const { RNAO3Scraper } = NativeModules;

//native modules export keys/name
const NM_KEYS = {
  getWorksFromURL         : 'getWorksFromURL',
  getFandomMediaCategories: 'getFandomMediaCategories',
};

export default {
  AO3Scraper: RNAO3Scraper,

  async getWorksFromURL(url = "") {
    try {
      const jsonStr = await RNAO3Scraper[NM_KEYS.getWorksFromURL](url);
      return JSON.parse(jsonStr);
      
    } catch(error){
      console.log(`Unable to retrieve webpage: ${url}`);
      console.log(error);
      return null;
    };
  },

  async getFandomMediaCategories(){
    try {
      const jsonStr = await RNAO3Scraper[NM_KEYS.getFandomMediaCategories]();
      return JSON.parse(jsonStr);
      
    } catch(error){
      console.log(`Unable to get fandom media list.`);
      console.log(error);
      return null;
    };
  },
};