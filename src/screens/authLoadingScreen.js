import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Platform, StyleSheet, Text, View, Clipboard, ScrollView, Dimensions, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';

import { NavBarValues } from '../constants/uiValues';
  
export class AuthLoadingScreen extends React.Component {
  constructor(props){
    super(props);
    
    this.state = {
      didLoadUIValues: false,
    };
  };

  async componentDidMount(){
    const { navigation } = this.props;

    try {
      NavBarValues.initializeValues();

    } catch(error){
      Alert.alert('Error', 'Unable initialize values.');
    };

    navigation.navigate(userToken ? 'App' : 'Auth');
  };

  render(){
    return(
      null
    );
  };
};