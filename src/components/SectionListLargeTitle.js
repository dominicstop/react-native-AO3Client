import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Platform, StyleSheet, Text, View, Dimensions, SectionList } from 'react-native';

import { NavBarValues } from '../constants/uiValues';

import { BlurView } from 'expo-blur';

import Animated, { Easing } from 'react-native-reanimated';
const { concat, floor, Extrapolate, interpolate, spring, neq, diffClamp, debug, add, cond, diff, divide, eq, event, exp, lessThan, and, call, block, multiply, pow, set, abs, clockRunning, greaterOrEq, lessOrEq, sqrt, startClock, stopClock, sub, Clock, Value, or, timing } = Animated;

const { width: screenWidth } = Dimensions.get('screen');

const AnimatedBlurView    = Animated.createAnimatedComponent(BlurView   );
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

const NAVBAR_NORMAL = NavBarValues.getHeaderHeight     (true);
const NAVBAR_LARGE  = NavBarValues.getHeaderHeightLarge(true);


export class SectionListLargeTitle extends React.PureComponent {
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
    listHeader: {
      width: '100%', 
      backgroundColor: 'white'
    },
  });

  constructor(props){
    super(props);

    const subtitleHeight = (props.showSubtitle? props.subtitleHeight : 0);
    const NAVBAR_FHEIGHT = (NAVBAR_LARGE + subtitleHeight);

    this._titleLargeWidth  = new Value(-1);
    this._titleLargeHeight = new Value(-1);
    this._scrollY          = new Value(0 );

    this._handleOnScroll = event([{ 
      nativeEvent: ({contentOffset: {y}}) => block([
        set(this._scrollY, y),
      ])
    }]);

    this._headerHeight = interpolate(this._scrollY, {
      inputRange      : [0, NAVBAR_NORMAL],
      outputRange     : [NAVBAR_FHEIGHT, NAVBAR_NORMAL],
      extrapolateLeft : Extrapolate.EXTEND,
      extrapolateRight: Extrapolate.CLAMP ,
    });

    const diff   = (NAVBAR_FHEIGHT - NAVBAR_NORMAL);
    const offset = (diff - NAVBAR_NORMAL)
    this._sectionListTransY = interpolate(this._scrollY, {
      inputRange : [0, NAVBAR_NORMAL],
      outputRange: [offset,  0],
      extrapolateLeft : Extrapolate.EXTEND,
      extrapolateRight: Extrapolate.CLAMP
    });

    this._bGOpacity = interpolate(this._scrollY, {
      inputRange : [0, NAVBAR_NORMAL],
      outputRange: [1, 0.75],
      extrapolate: Extrapolate.CLAMP,
    });

    this._subtitleHeight = interpolate(this._scrollY, {
      inputRange      : [0, NAVBAR_NORMAL],
      outputRange     : [subtitleHeight, 0],
      extrapolateLeft : Extrapolate.EXTEND,
      extrapolateRight: Extrapolate.CLAMP ,
    });

    this._subtitleOpacity = interpolate(this._scrollY, {
      inputRange : [0, (NAVBAR_NORMAL/2)],
      outputRange: [1, 0],
      extrapolate: Extrapolate.CLAMP,
    });

    this._titleTransX = interpolate(this._scrollY, {
      inputRange : [0, NAVBAR_NORMAL],
      outputRange: [0, (screenWidth / 1.8)],
      extrapolate: Extrapolate.CLAMP,
    });

    this._titleTransY = interpolate(this._scrollY, {
      inputRange : [0, NAVBAR_NORMAL],
      outputRange: [0, -(NAVBAR_NORMAL / 3.25)],
      extrapolate: Extrapolate.CLAMP,
    });

    const titleMargin      = 10;
    const titleWidthMidIn  = (NAVBAR_NORMAL / 1.35);
    const titleWidthMidOut = divide(add(this._titleLargeWidth, screenWidth), 1.35);
    
    this._headerTitleWidth = interpolate(this._scrollY, {
      inputRange : [0, titleWidthMidIn, NAVBAR_NORMAL],
      outputRange: [this._titleLargeWidth, titleWidthMidOut, screenWidth],
      extrapolate: Extrapolate.CLAMP,
    });
    
    const NAVBAR_ADJ = NavBarValues.getHeaderHeight(false);
    this._titleContainerHeight = interpolate(this._scrollY, {
      inputRange : [0, NAVBAR_NORMAL],
      outputRange: [add(this._titleLargeHeight, titleMargin), NAVBAR_ADJ],
      extrapolate: Extrapolate.CLAMP,
    });

    this._titleTransScale = interpolate(this._scrollY, {
      inputRange : [-NAVBAR_NORMAL, 0, NAVBAR_NORMAL],
      outputRange: [1.045, 1, 0.65],
      extrapolate: Extrapolate.CLAMP,
    });

    this._titleFontWeight = floor(
      interpolate(this._scrollY, {
        inputRange : [0, (NAVBAR_NORMAL/4), NAVBAR_NORMAL],
        outputRange: [9, 9, 3],
        extrapolate: Extrapolate.CLAMP,
      })
    );
  };

  _handleOnLayoutTitleLarge = ({nativeEvent}) => {
    if(!this._isTitleLargeMeasured){
      const { x, y, width, height } = nativeEvent.layout;
      this._titleLargeHeight.setValue(height);
      this._titleLargeWidth.setValue(width + (width / 6.15) + 10);
      console.log(`
        width: ${width}
        height: ${height}
      `);
      this._isTitleLargeMeasured = true;
    };
  };

  _renderSubtitle(){
    const { styles } = SectionListLargeTitle;
    const { showSubtitle, renderSubtitle, ...props } = this.props;
    if(!showSubtitle) return null;

    const subtitleContainerStyle = {
      height : this._subtitleHeight ,
      opacity: this._subtitleOpacity,
      transform: [
        { translateX: this._titleTransX },
        { translateY: this._titleTransY }
      ],
    };

    return(
      <Animated.View style={[styles.subtitleContainer, subtitleContainerStyle]}>
        {renderSubtitle? (
          //render custom subtitle comp
          subtitleText()
        ):(
          <Text style={[styles.subtitleText, props.subtitleStyle]}>
            {props.subtitleText}
          </Text>
        )}
      </Animated.View>
    );
  };

  _renderHeader(){
    const { styles } = SectionListLargeTitle;

    const headerContainerStyle = {
      height: this._headerHeight,
    };

    const backgroundStyle = {
      opacity: this._bGOpacity
    };

    //controls horizontal alignment
    const titleWrapperStyle = {
      height       : this._headerHeight    ,
      width        : this._headerTitleWidth,
      paddingBottom: this._subtitleHeight  ,
    };

    //controls vertical alignment
    const titleContainer = {
      height: this._titleContainerHeight,
      transform: [
        { scale: this._titleTransScale },
      ]
    };

    const titleLarge = {
      fontWeight: concat(this._titleFontWeight, '00')
    };

    return(
      <AnimatedBlurView 
        style={[styles.headerContainer, headerContainerStyle]}
        intensity={100}
      >
        <Animated.View style={[styles.background, backgroundStyle]}/>
        <Animated.View style={[styles.titleWrapper, titleWrapperStyle]}>
          <Animated.View style={[styles.titleContainer, titleContainer]}>
            <View onLayout={this._handleOnLayoutTitleLarge}>
              <Animated.Text style={[styles.titleLarge, titleLarge]}>
                {this.props.titleText}
              </Animated.Text>
            </View>
          </Animated.View>
        </Animated.View>
        {this._renderSubtitle()}
      </AnimatedBlurView>
    );
  };

  _renderListHeader = () => {
    const { styles } = SectionListLargeTitle;
    const { ListHeaderComponent: header } = this.props;

    return(
      <Fragment>
        <View style={[styles.listHeader, {height: NAVBAR_NORMAL}]}/>
        {header && header()}
      </Fragment>
    );
  };

  render(){
    const { styles } = SectionListLargeTitle;
    const { ListHeaderComponent, ...sectionListProps } = this.props;

    const sectionListStyle = {
      paddingTop: NAVBAR_NORMAL,
      transform : [
        {translateY: this._sectionListTransY}
      ]
    };

    return(
      <View style={styles.rootContainer}>
        <AnimatedSectionList
          style={[sectionListStyle]}
          scrollEventThrottle={1}
          onScroll={this._handleOnScroll}
          onScrollEndDrag={this._handleOnScrollEndDrag}
          snapToOffsets={[NAVBAR_NORMAL]}
          //contentInset={{top: 200}}
          scrollIndicatorInsets={{top: NAVBAR_NORMAL}}
          ListHeaderComponent={this._renderListHeader}
          {...sectionListProps}
        />
        {this._renderHeader()}
      </View>
    );
  };
};