import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Platform, StyleSheet, Text, View, Clipboard, ScrollView, Dimensions, TextInput, TouchableOpacity, FlatList } from 'react-native';

import { Divider } from 'react-native-elements';

import { WorkItem } from '../models/workModel';

import { TagsItem, TagsGroup } from './TagsGroup';

const { width: screenWidth } = Dimensions.get('screen');

export class WorkList extends React.Component {
  static propTypes = {
    workItems: PropTypes.array.isRequired,
  };

  static styles = StyleSheet.create({
    itemContainer: {
      marginHorizontal: 10, 
      paddingHorizontal: 10, 
      paddingVertical: 10, 
      marginBottom: 20, 
      borderColor: 'rgba(0,0,0,0.2)', 
      borderWidth: 1, 
      borderRadius: 10
    },
    workTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
    workAuthor: {
      fontSize: 18,
      fontWeight: '500',
      color: 'rgba(0,0,0,0.75)'
    },
    divider: {
      margin: 15,
    },
  });

  _renderItem = ({item, index}) => {
    const { styles } = WorkList;
    const work = WorkItem.wrap(item);

    const tags = work.tagsfreeforms.map(tag => 
      TagsItem.wrap({text: tag.name, value: tag.link})
    );

    return(
      <View style={styles.itemContainer}>
        <Text style={styles.workTitle}>{work.workTitle}</Text>
        <Text style={styles.workAuthor}>{work.authorName}</Text>
        <Divider style={styles.divider}/>
        <TagsGroup
          containerWidth={screenWidth - (20 * 2)}
          {...{tags}}
        />
      </View>
    );
  };

  render(){
    const { workItems: data, ...flatListProps } = this.props;
    return (
      <FlatList
        renderItem={this._renderItem}
        {...{data, ...flatListProps}}
      />
    );
  };
};