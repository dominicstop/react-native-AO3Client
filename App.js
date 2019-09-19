import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Platform, StyleSheet, Text, View, Clipboard, ScrollView, Dimensions, TextInput, TouchableOpacity, FlatList } from 'react-native';

import { WorkList } from './src/components/WorkList';

import AO3Parser from './src/native_modules/AO3Parser';
import { WorkItem } from './src/models/workModel';
import { BNHAWork01 } from './test_data/workList';

export default class App extends React.Component {
  static styles = StyleSheet.create({
    rootContainer: {
      flex: 1,
      paddingTop: 20,
    },
  });  

  constructor(props){
    super(props);
    this.state = {
      works: [],
    };
  };

  async componentDidMount(){
    const worksURL = 'https://archiveofourown.org/tags/%E5%83%95%E3%81%AE%E3%83%92%E3%83%BC%E3%83%AD%E3%83%BC%E3%82%A2%E3%82%AB%E3%83%87%E3%83%9F%E3%82%A2%20%7C%20Boku%20no%20Hero%20Academia%20%7C%20My%20Hero%20Academia/works';
    const worksRaw = await AO3Parser.getWorksFromURL(worksURL);
    const works    = WorkItem.wrapArray(worksRaw);

    this.setState({works});
  };

  render() {
    const { styles } = App;

    
    const oldTags = ["Demon slayer is lit", "kimetsu no yaiba is amazing", "i still love bhna thooo", "mha and kny are both good", "stan tanjiro", "stan izuku", "izuku and tanjiro are both good boys uwu", "anime of the YEAR", "the animation?", "art style??", "so mf good", "my crops are watered", "I have been BLESSED by the anime gods", "thanks for the food", "i ship deku and kacchan", "fite me", "NEZUKO IS BEST GIRL", "not to be dramatic, but would die for her", "protect her at all cost", "nezuko deserves the world", "crying", "ya'll can clown me but idc", "i'm fuji and weaboo trash butttt ther's so much good anime this season and i'm like????", "i dont have time bb", "su is also good", "have you SEEN the new movie??", "pink diamond is trash", "i hate rose, fuck her", "spinel is baby", "spinel deserves love", "um greg universe", "also the mermaid sisters are fine af", "fucking bullshit song goes hardddd", "they deserved to WIN DAMN IT", "watch carole and tuesday", "its also good btw", "it's on netflix, so no excuses bb"];
    const oldTagsConverted = oldTags.map(oldTag => ({text: oldTag, value: oldTag, containerStyle: {}, textStyle: {}}));

    const tags = [
      ...oldTagsConverted,
      {text: 'Demon Slayer', value: 'Demon Slayer', containerStyle: { backgroundColor: 'red'    }, textStyle: {}},
      {text: 'KNY'         , value: 'KNY'         , containerStyle: { backgroundColor: 'blue'   }, textStyle: {}},
      {text: 'BNH'         , value: 'BNH'         , containerStyle: { backgroundColor: 'yellow' }, textStyle: {}},
    ];

    //const workItems = WorkItem.wrapArray(dummyDataBhnaWork01);

    return (
      <ScrollView style={styles.rootContainer}>
        <WorkList
          workItems={this.state.works}
        />
      </ScrollView>
    );
  }
};