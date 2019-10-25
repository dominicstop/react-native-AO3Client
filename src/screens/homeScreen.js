import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Platform, StyleSheet, Text, View, Clipboard, ScrollView, Dimensions, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';

import { NavBarValues } from '../constants/uiValues';
import { TagsGroup, TagsItem } from '../components/TagsGroup';
import { PURPLE, VIOLET, INDIGO, BLUE, YELLOW, ORANGE, AMBER, RED } from '../constants/colors';

import chroma from 'chroma-js'

const { width } = Dimensions.get('screen');

const artist1 = ["red orange country", "boy pablo", "phum", "mxmtoon", "girl in red", "marias", "conan gray", "cavetown", "umi", "rini", "joji", "alextbh", "clairo", "beabadoobee", "hers", "cuco", "rina", "omar apollo", "crwn", "tala", "earl of manila", "fkj", "fern", "steve lacy", "between friends", "men i trust", "daniel caesar", "michael sayer", "still woozy", "mitski", "the walters", "charlie burg", "rory webley", "beach bunny", "gus dapperton", "raveena", "elohim", "yuna", "sabrina claudio", "dijon", "roy blair", "keshi", "willow", "eery", "mac ayres", "jorja smith", "snoh aalegra", "alina baraz", "gabe bondoc", "honne", "peter manos", "curtis smith", "wallows", "kid bloom", "prep", "svmmerdose", "feyde", "khai", "khai dreams", "berhana", "rkcb", "verite", "jeremy passion", "ross david", "ysango", "ukewithnix", "sophia kao", "jess connelly", "bruno major", "david so", "h.e.r.", "surfaces", "jaie", "niki (zephyr)", "kehlani", "charlotte lawrence", "mtch", "novakane", "sophie meisers", "swum"];
const artist2 = ['slowdive', 'spencer', 'jadu heart', 'reaper', 'jai paul', 'daniela andreda', 'frank ocean', 'porches', 'vansire', 'carter vail', 'modern nomad', 'faye webster', 'lev snowe', 'dreams weve had', 'kevin krauster', 'floor cry', 'scuva dvla', 'denuo', 'dannah colen', 'tercecojo', 'yeule', 'monks', 'foliage', 'micra', 'amber arcade', 'mellow gang', 'the vyrll', 'sleep habbits', 'hibou', 'eddie the wheel', 'golden daze', 'cryodeyser', 'barrie', 'fauves', 'ruby haunt', 'hydromag', 'babeheaven', 'hibou', 'bumby', 'junjodream', 'elizabeth', 'launder', 'quicksilver', 'fanclub', 'llovers', 'divino nino', 'gwenmo', 'field trip', 'foliage', 'oddnesse', 'anemone', 'beach house', 'boy azooga', 'shy boys', 'halo maud', 'winter', 'film school', 'still corners', 'boys', 'toy', 'mike edge', 'hun bjorn', 'squid', 'hatchie', 'fanclub'];
const artist = [...artist1, ...artist2];

const palete1 = [VIOLET.A700, PURPLE.A700, INDIGO.A700, BLUE.A700];
const palete2 = [YELLOW.A700, AMBER.A700, ORANGE.A700, RED.A700];
const palete3 = ['#00416A', '#799F0C', '#FFE000'];

const colors = chroma.scale(palete1).colors(artist.length);

const tags1 = artist.map((artist, index) => 
  TagsItem.wrap({
    text: artist, 
    value: artist,
    textStyle: { color: 'white', fontWeight: '500', paddingVertical: 4 },
    containerStyle: { backgroundColor: colors[index]},
  })
);

const spacerTag = TagsItem.wrap({
    text: ' ', 
    value: ' ',
    textStyle: { color: 'white' },
    containerStyle: { backgroundColor: 'white' },
  })

const tags = [spacerTag, ...tags1];
 
export class HomeScreen extends React.Component {
  static styles = StyleSheet.create({
    rootContainer: {
      flex: 1,
      paddingTop: 40,
      paddingHorizontal: 5,
    },
  });

  constructor(props){
    super(props);
  };

  render(){
    const { styles } = HomeScreen;
    return(
      <ScrollView style={styles.rootContainer}>
        <Text style={{paddingLeft: 5, paddingBottom: 10, fontWeight: '900', fontSize: 40, fontFamily: 'Avenir Next'}}>Lofi/Indie</Text>
        <TagsGroup
          containerStyle={{paddingBottom: 80}}
          {...{tags}}
          containerWidth={width - 10}
          charSize={16}
        />
      </ScrollView>
    );
  };
};