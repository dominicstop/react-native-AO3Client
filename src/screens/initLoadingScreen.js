import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Platform, StyleSheet, Text, View, Clipboard, ScrollView, Dimensions, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';

import { SimpleStore, STORE_KEYS } from '../functions/simpleStore';
import AO3 from '../native_modules/AO3Parser';

import { NavBarValues } from '../constants/uiValues';
import { PURPLE, BLUE } from '../constants/colors';
import { ROUTES } from '../constants/navRoutes';
  
export class InitLoadingScreen extends React.Component {
  static styles = StyleSheet.create({
    rootContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: BLUE.A700,
    },
  });

  constructor(props){
    super(props);
    
    this.state = {
      didLoadUIValues: false,
    };
  };

  async componentDidMount(){
    const { navigation } = this.props;

    try {
      const categories = await AO3.getFandomMediaCategories();
      await SimpleStore.set(STORE_KEYS.mediaCategories, categories);

      console.log('categories');
      console.log(categories);

    } catch(error){
      console.log(error);
    };

    navigation.navigate(ROUTES.appNavRoute);
  };

  render(){
    const { styles } = InitLoadingScreen;
    return(
      <View style={styles.rootContainer}>
        
      </View>
    );
  };
};