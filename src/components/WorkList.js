import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Platform, StyleSheet, Text, View, Clipboard, ScrollView, Dimensions, TextInput, TouchableOpacity, FlatList } from 'react-native';

import { TagsItem, TagsGroup } from './TagsGroup';

const { width: screenWidth } = Dimensions.get('screen');

export class WorkList extends React.Component {
  static propTypes = {
    workItems: PropTypes.array.isRequired,
  };

  _renderItem = ({item, index}) => {
    const work = WorkItem.wrap(item);

    const tags = work.tagsfreeforms.map(tag => 
      TagsItem.wrap({text: tag.name, value: tag.link})
    );

    return(
      <View style={{marginHorizontal: 10, paddingHorizontal: 10, paddingVertical: 10, marginBottom: 20, borderColor: 'rgba(0,0,0,0.1)', borderWidth: 1, borderRadius: 10}}>
        <Text>{work.workTitle}</Text>
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