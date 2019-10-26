import { NativeModules } from 'react-native'

const { RNMeasureText } = NativeModules;

//native modules export keys/name
const NM_KEYS = {
  getHeightAndWidth: 'getHeightAndWidth',
};

export default {
  RNMeasureText: RNMeasureText,

  async getHeightAndWidth(){
    const result = await RNMeasureText[NM_KEYS.getHeightAndWidth](["Test1", "Test3"], 'default', 12, '300');
    console.log(result);
  },
};