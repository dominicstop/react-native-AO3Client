import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Platform, StyleSheet, Text, View, Clipboard, ScrollView, Dimensions, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';

import MeasureText from '../native_modules/MeasureText';

export class MeasureTextTest extends React.Component {
  static styles = StyleSheet.create({
    rootContainer: {
      flex: 1,
      paddingTop: 40,
      paddingHorizontal: 5,
      flexDirection: 'row',
    },
    textContainer: {
      backgroundColor: 'red',
      alignItems: 'center',
    },
    text: {
      flex: 0,
      backgroundColor: 'blue',
    },
  });

  constructor(props){
    super(props);

    this.state = {
      data: [],
    };
  };

  async componentDidMount(){
    const data = [
      {string: "Hello World", style: {fontFamily: 'Helvetica', fontSize: 18, fontWeight: '100'}},
      {string: "Hello World", style: {fontFamily: 'Helvetica', fontSize: 19, fontWeight: '200'}},
      {string: "Hello World", style: {fontFamily: 'Helvetica', fontSize: 20, fontWeight: '300'}},
      {string: "Hello World", style: {fontFamily: 'Helvetica', fontSize: 21, fontWeight: '400'}},
      {string: "Hello World", style: {fontFamily: 'Helvetica', fontSize: 22, fontWeight: '500'}},
      {string: "Hello World", style: {fontFamily: 'Helvetica', fontSize: 23, fontWeight: '600'}},
      {string: "Hello World", style: {fontFamily: 'Helvetica', fontSize: 24, fontWeight: '700'}},
      {string: "Hello World", style: {fontFamily: 'Helvetica', fontSize: 25, fontWeight: '800'}},
      {string: "Hello World", style: {fontFamily: 'Helvetica', fontSize: 26, fontWeight: '900'}},
    ];

    let newData = [];

    for (const item of data) {
      const { string, style } = item;
      const results = await MeasureText.getHeightAndWidth({
        strings   : [string]        , 
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
        fontSize  : style.fontSize  ,
      });

      const { width, height } = results[string];
      newData.push({...item, width: (width + 10), height});
    };

    console.log(newData);
    this.setState({data: newData});
  };

  _keyExtractor = (item, index) => {
    return(`item-${item.string}-${index}`);
  };

  _renderItem = ({item, index}) => {
    const { styles } = MeasureTextTest;
    
    const containerStyle = {
      width : item.width ,
      height: item.height,
    };

    return(
      <View style={[styles.textContainer, containerStyle]}>
        <Text style={[item.style, styles.text]}>
          {item.string}
        </Text>
      </View>
    );
  };

  render(){
    const { styles } = MeasureTextTest;
    const { data } = this.state;
    return(
      <View style={styles.rootContainer}>
        <FlatList
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}
          {...{data}}
        />
      </View>
    );
  };
};