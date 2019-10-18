import { useSafeArea } from 'react-native-safe-area-context';

let safeAreaInsets = {
  top   : 0,
  bottom: 0,
  left  : 0,
  right : 0,
};

export class NavBarValues {
  static Constants = {
    headerHeight     : 0,
    headerHeightLarge: 0,
  };

  static async initializeValues(){

    const insets = useSafeArea();
    //const insets = await SafeArea.getSafeAreaInsetsForRootView();
    safeAreaInsets = insets;
    alert(insets.top);
  };

  static get headerHeight() {
    return NavBarValues.headerHeight;
  };

  static get safeAreaInsets(){
    return safeAreaInsets;
  };
};