import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Platform, StyleSheet, Text, View, Clipboard, ScrollView, Dimensions, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';

import { SafeAreaConsumer } from 'react-native-safe-area-context';

import { SimpleStore, STORE_KEYS } from '../functions/simpleStore';

import { NavBarValues } from '../constants/uiValues';
import { PURPLE } from '../constants/colors';
import { ROUTES } from '../constants/navRoutes';
  
export class AuthLoadingScreen extends React.Component {
  static contextType = SafeAreaConsumer;

  static styles = StyleSheet.create({
    rootContainer: {
      flex: 1,
      backgroundColor: PURPLE.A700,
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
    const insets = this.context;

    try {
      //set and cache inset values
      NavBarValues.safeAreaInsets = insets;
      const mediaCategories = await SimpleStore.read(STORE_KEYS.mediaCategories);
      
      navigation.navigate(mediaCategories
        ? ROUTES.appNavRoute 
        : ROUTES.initLoadingRoute
      );

    } catch(error){
      Alert.alert('Error', 'Unable initialize values.');
      navigation.navigate( ROUTES.browseCategoryRoute);
    };
  };

  render(){
    const { styles } = AuthLoadingScreen;
    return(
      <View style={styles.rootContainer}>
        
      </View>
    );
  };
};