import { Header } from 'react-navigation-stack';

let safeAreaInsets = {
  top   : 20,
  bottom: 0 ,
  left  : 0 ,
  right : 0 ,
};

export class NavBarValues {
  static Constants = {
    headerHeight     : Header.HEIGHT, //Full: 64 , w/o inset: 44
    headerHeightLarge: 115          , //Full: 115, w/o inset: 95
  };

  static set safeAreaInsets(insets){
    safeAreaInsets = insets;
  };

  static getHeaderHeight(withInset = false) {
    const { headerHeight } = NavBarValues.Constants;

    return(withInset
      ? headerHeight + safeAreaInsets.top
      : headerHeight 
    );
  };

  static getHeaderHeightLarge(withInset = false) {
    const { headerHeightLarge } = NavBarValues.Constants;
    
    return(withInset
      ? headerHeightLarge + safeAreaInsets.top
      : headerHeightLarge
    );
  };

  static get safeAreaInsets(){
    return safeAreaInsets;
  };
};