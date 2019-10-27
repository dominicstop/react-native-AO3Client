import { NativeModules } from 'react-native'

const { RNMeasureText } = NativeModules;

//native modules export keys/name
const NM_KEYS = {
  getHeightAndWidth: 'getHeightAndWidth',
};

export default {
  RNMeasureText: RNMeasureText,

  /** returns {"string": {width, height}} */
  async getHeightAndWidth({strings = [], fontFamily = '', fontSize = 0, fontWeight = ''}){
    try {
      const result = await RNMeasureText[NM_KEYS.getHeightAndWidth](strings, fontFamily, fontSize, fontWeight);
      return(result);
      
    } catch(error){
      console.log(`MeasureText - getHeightAndWidth: Unable to get width/height`);
      console.log(error);
      return null;
    };
  },
};