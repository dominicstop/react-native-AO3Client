import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Platform, StyleSheet, Text, View, Clipboard, ScrollView, Dimensions, TextInput, TouchableOpacity, FlatList, Alert, SectionList } from 'react-native';


import { BlurView } from 'expo-blur';

import Animated, { Easing } from 'react-native-reanimated';
const { concat, floor, Extrapolate, interpolate, spring, neq, diffClamp, debug, add, cond, diff, divide, eq, event, exp, lessThan, and, call, block, multiply, pow, set, abs, clockRunning, greaterOrEq, lessOrEq, sqrt, startClock, stopClock, sub, Clock, Value, or, timing } = Animated;

import { SimpleStore, STORE_KEYS } from '../functions/simpleStore';

import { SectionListLargeTitle } from '../components/SectionListLargeTitle';

import { NavBarValues } from '../constants/uiValues';
import { PURPLE, VIOLET, BLUE } from '../constants/colors';
import { ROUTES } from '../constants/navRoutes';

const { width: screenWidth } = Dimensions.get('screen');

const DATA = [
  {
    title: 'Main dishes',
    data: ['Pizza', 'Burger', 'Risotto', 'Steak', 'Lasagna'],
  },
  {
    title: 'Sides',
    data: ['French Fries', 'Onion Rings', 'Fried Shrimps', 'Curly Fries', 'Hash Browns'],
  },
  {
    title: 'Drinks',
    data: ['Water', 'Coke', 'Beer', 'Sprite'],
  },
  {
    title: 'Desserts',
    data: ['Cheese Cake', 'Ice Cream', 'Pie'],
  },
  {
    title: 'Snacks',
    data: ['Potato Chips', 'Muffins'],
  },
];

class CategoryList extends React.PureComponent {
  static propTypes = {
    titleText     : PropTypes.string,
    subtitleText  : PropTypes.string,
    subtitleHeight: PropTypes.number,
    showSubtitle  : PropTypes.bool  ,
    renderSubtitle: PropTypes.func  ,
  };

  static defaultProps = {
    subtitleHeight: 30,
    titleText: 'Large Title',
    subtitleText: 'Hello subtitle',
    showSubtitle: true,
  };

  static styles = StyleSheet.create({
    rootContainer: {
      flex: 1,
    },
    dummyItem1: {
      width: '100%',
      height: 50,
    },
    headerContainer: {
      position: "absolute",
      width: '100%',
      overflow: 'hidden',
    },
    background: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
    },
    subtitleContainer: {
      //backgroundColor: 'green',
      position: 'absolute',
      width: '100%',
      marginLeft: 10,
      overflow: 'hidden',
      bottom: 0,
    },
    //controls horizontal alignment
    titleWrapper: {
      //backgroundColor: 'blue',
      position: "absolute",
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    //controls vertical alignment
    titleContainer: {
      //backgroundColor: 'orange',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginLeft: 10,
    },
    titleLarge: {
      //backgroundColor: 'yellow',
      fontSize: 34,
      fontWeight: '900',
    },
    subtitleText: {
      fontSize: 20,
      fontWeight: '400',
      opacity: 0.8,
    },

    itemContainer: {
      padding: 20,
      backgroundColor: BLUE.A700,
    },
    title: {
      fontSize: 18,
      color: 'white'
    },
    sectionHeaderContainer: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: 'rgba(255,255,255,0.75)',
    },
    sectionHeaderTitle: {
      fontSize: 20,
      fontWeight: '700'
    },
  });

  constructor(props){
    super(props);
  };

  _renderItem = ({item, index}) => {
    const { styles } = CategoryList;

    const colors = [
      PURPLE[900],
      PURPLE[800],
      PURPLE[700],
      PURPLE[600],
      PURPLE[500],
    ];

    const backgroundColor = colors[index];

    return (
      <View style={[styles.itemContainer, {backgroundColor}]}>
        <Text style={styles.title}>{item}</Text>
      </View>
    );
  };

  _renderListHeader = () => {
    return(
      <View style={{width: '100%', padding: 10, backgroundColor: BLUE.A700}}>
        <Text style={{color: 'white', fontSize: 28, fontWeight: '600'}}>Header</Text>
        <Text style={{color: 'white', fontSize: 18, fontWeight: '300'}}>Subtitle Lorum</Text>
        <Text style={{color: 'white', fontSize: 18, fontWeight: '300'}}>Subtitle Lorum</Text>
        <Text style={{color: 'white', fontSize: 18, fontWeight: '300'}}>Subtitle Lorum</Text>
        <Text style={{color: 'white', fontSize: 18, fontWeight: '300'}}>Subtitle Lorum</Text>
        <Text style={{color: 'white', fontSize: 18, fontWeight: '300'}}>Subtitle Lorum</Text>
      </View>
    );
  };

  _renderSectionHeader = ({ section: { title } }) => {
    const { styles } = CategoryList;

    return (
      <BlurView intensity={100}>
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeaderTitle}>
            {title}
          </Text>
        </View>
      </BlurView>
    );
  };

  render(){
    const { styles } = CategoryList;

    return(
      <SectionListLargeTitle
        subtitleText={'Hello world subtitle'}
        listHeaderHeight={75}
        showSubtitle={true}
        ListHeaderComponent={this._renderListHeader}
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={this._renderItem}
        renderSectionHeader={this._renderSectionHeader}
      />
    );
  };
};

export class BrowseCategoryScreen extends React.Component {
  static styles = StyleSheet.create({
    rootContainer: {
      flex: 1,
      //backgroundColor: VIOLET.A700,
      //marginTop: NavBarValues.getHeaderHeightLarge(true),
    },
  });

  constructor(props){
    super(props);
    
    //get cached categories
    const categories = SimpleStore.readCache(STORE_KEYS.mediaCategories);
    
    this.state = {
      categories,
    };
  };

  async componentDidMount(){

  };

  render(){
    const { styles } = BrowseCategoryScreen;
    return(
      <View style={styles.rootContainer}>
        <CategoryList/>
      </View>
    );
  };
};