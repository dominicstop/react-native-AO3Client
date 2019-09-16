import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Platform, StyleSheet, Text, View, Clipboard, ScrollView, Dimensions  } from 'react-native';

import AO3Parser from './src/native_modules/AO3Parser';

const { width: screenWidth } = Dimensions.get('screen');

class TagsGroup extends React.Component {
  static propTypes = {
    //required props
    tags          : PropTypes.array .isRequired,
    containerWidth: PropTypes.number.isRequired,
    //options
    enableCustomStylePerTag: PropTypes.bool,
    //style props
    containerStyle   : PropTypes.object,
    rowContainerStyle: PropTypes.object,
    tagTextStyle     : PropTypes.object,
    tagContainerStyle: PropTypes.object,
  };

  static defaultProps = {
    charSize     : 15,
    innerPadding : 7 ,
    seperatorSize: 7 ,
  };
  
  static styles = StyleSheet.create({
    rootContainer: {
      flexDirection: 'column', 
      flexWrap: 'nowrap',
    },
    rowContainer: {
      flexDirection: 'row', 
      overflow: 'hidden',
      marginBottom: 7,
    },
    tagContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'lightgrey',
      paddingVertical: 3,
    },  
    tagText: {
      textAlign: 'center',
      fontFamily: 'Menlo-Regular',
    },
  });

  static TAG_TYPE = {
    FULL : 'FULL' , // <tag>
    LEFT : 'LEFT' , // <tag|
    BREAK: 'BREAK', // |tag|
    RIGHT: 'RIGHT', // |tag>
    NLINE: 'NLINE', // \n
  };

  createTagComp = (tagType = '', tagText = '') => {
    const { styles, TAG_TYPE } = TagsGroup;
    const { charSize, seperatorSize, innerPadding, ...props } = this.props;
    
    const charWidth = (charSize / 1.5);
    const radius    = (charSize / 2);

    const borderStyle = (() => {
      switch (tagType) {
        case TAG_TYPE.FULL: return (
          { borderRadius: radius }
        );
        case TAG_TYPE.LEFT: return (
          { borderTopLeftRadius: radius, borderBottomLeftRadius: radius }
        );
        case TAG_TYPE.RIGHT: return (
          { borderTopRightRadius: radius, borderBottomRightRadius: radius }
        );
        case TAG_TYPE.BREAK: return (
          { flex: 1, borderRadius: 0 }
        );
      };
    })();

    const isTagTextShort = (tagText.length <= 5      );
    const isLastTagInRow = (tagType == TAG_TYPE.LEFT );
    const isOnlyTagInRow = (tagType == TAG_TYPE.BREAK);

    const textWidth   = (tagText.length * charWidth);
    const textPadding = (isTagTextShort
      ? innerPadding * 2
      : innerPadding 
    );

    const sharedContainerStyles = {
      width: textWidth + textPadding,
      //add right margin
      ...((!isLastTagInRow && !isOnlyTagInRow) && 
        { marginRight: seperatorSize }
      ),
    };
    
    const key = `${tagType}-${tagText}`;
    
    return(
      <View 
        key={`tagContainer-${key}`}
        style={[styles.tagContainer, props.tagContainerStyle, {...borderStyle, ...sharedContainerStyles}]}
      >
        <Text
          key={`tagText-${key}`}
          style={[styles.tagText, styles.tagTextStyle, {fontSize: charSize}]}>
          {tagText}
        </Text>
      </View>
    );
  };

  createTags = () => {
    const { styles, TAG_TYPE } = TagsGroup;
    const { tags: _tags, charSize, containerWidth, ...props } = this.props;
    //create copy of tags
    const tags = [..._tags];
    const charWidth = (charSize / 1.5);
    
    //init with containerWidth prop
    let remainingWidth = containerWidth;
    
    let excess   = [];
    let tagTypes = [];

    let row      = 0;
    let compRows = [];
    let compCols = [];

    const createRow = (isLastRow) => {
      const justifyContent = (isLastRow? 'flex-start' : 'space-between');
      row += 1;
      //encapsulate cols inside row comp
      compRows.push(
        <View 
          key={`row-${row}`}
          style={[styles.rowContainer, {justifyContent}]}
        >
          {compCols}
        </View>
      );

      //reset columms
      compCols = [];
    };

    while ((tags.length != 0) || (excess.length != 0)) {
      const prevTagType = tagTypes[tagTypes.length - 2];
      const currTagType = tagTypes[tagTypes.length - 1];

      const hasExcess = (excess.length  >  0);
      const isFull    = (remainingWidth <= 0);

      const tag = !isFull && (hasExcess
        ? excess.pop  ()
        : tags  .shift()
      );
      
      const isTagShort   = (tag.length <= 5);
      const innerPadding = (isTagShort
        ? props.innerPadding * 2
        : props.innerPadding 
      );
      
      const extraSpace = (props.seperatorSize + innerPadding);
      const textWidth  = (((tag.length || 0) * charWidth) + extraSpace);      

      if(isFull){
        //insert a new row        
        createRow(false);

        //record tag type
        tagTypes.push(TAG_TYPE.NLINE);
        //reset remaining width
        remainingWidth = containerWidth;
      
      } else if((textWidth <= remainingWidth) && !isFull){
        //textThatFits is not empty or whitespace
        const nextTagType = (
          ((currTagType == TAG_TYPE.NLINE) && (prevTagType == TAG_TYPE.BREAK))? TAG_TYPE.RIGHT : 
          ((currTagType == TAG_TYPE.NLINE) && (prevTagType == TAG_TYPE.LEFT ))? TAG_TYPE.RIGHT : TAG_TYPE.FULL
        );

        remainingWidth -= textWidth;
        tagTypes.push(nextTagType);
        compCols.push(this.createTagComp(nextTagType, tag));

      } else if((textWidth > remainingWidth) && !isFull){
        const excessWidth = ((textWidth >= remainingWidth)
          ? (textWidth      - remainingWidth)
          : (remainingWidth - textWidth     )
        );

        const excessCharCount = Math.floor(excessWidth / charWidth);
        const midpoint        = (tag.length - excessCharCount);

        //split tag into two, leading and trailing
        const textThatFits = tag.substr(0, midpoint);
        const textExcess   = tag.substr(midpoint, tag.length);

        const nextTagType = (
          ((textThatFits == '') || (textThatFits == ' '))? null : 
          //textThatFits is not empty or whitespace
          ((currTagType == TAG_TYPE.NLINE) && (prevTagType == TAG_TYPE.LEFT ))? TAG_TYPE.BREAK :
          ((currTagType == TAG_TYPE.NLINE) && (prevTagType == TAG_TYPE.BREAK))? TAG_TYPE.BREAK : TAG_TYPE.LEFT
        );
        
        if(nextTagType == null) {
          //null means skip, readd to tags list
          tags.unshift(tag);          
          //reset remaining
          remainingWidth = 0;

        } else {
          tagTypes.push(nextTagType);
          compCols.push(
            this.createTagComp(nextTagType, textThatFits)
          );

          excess.push(textExcess);
          //reset remaining
          remainingWidth = 0;
        };
      };
    };

    //insert last row, if any
    if(compCols.length != 0){
      createRow(true);      
    };

    return compRows;
  };

  render(){
    const { styles } = TagsGroup;
    const { containerWidth, ...props } = this.props;
    const tagComps = this.createTags();

    return(
      <View style={[styles.rootContainer, {width: containerWidth}, props.containerStyle]}>
        {tagComps}
      </View>
    );
  };
};

class WorkList extends React.Component {

  _renderItem = () => {
    return(
      <View/>
    );
  };

  render(){
    const { ...flatListProps } = this.props;
    return (
      <FlatList
        renderItem={this._renderItem}
        {...flatListProps}
      />
    );
  };
};

export default class App extends React.Component {
  static styles = StyleSheet.create({
    rootContainer: {
      flex: 1,
      paddingTop: 20,
    },
  });  

  async componentDidMount(){
    //const worksURL = 'https://archiveofourown.org/tags/%E5%83%95%E3%81%AE%E3%83%92%E3%83%BC%E3%83%AD%E3%83%BC%E3%82%A2%E3%82%AB%E3%83%87%E3%83%9F%E3%82%A2%20%7C%20Boku%20no%20Hero%20Academia%20%7C%20My%20Hero%20Academia/works';
    //const works = await AO3Parser.getWorksFromURL(worksURL);
    //Clipboard.setString(JSON.stringify(works));
    //console.log(works);
  };

  render() {
    const { styles } = App;

    return (
      <ScrollView style={styles.rootContainer}>
        <TagsGroup
          containerStyle={{alignSelf: 'center', marginBottom: 300}}
          containerWidth={screenWidth - 20}
          tags={["Demon slayer is lit", "kimetsu no yaiba is amazing", "i still love bhna thooo", "mha and kny are both good", "stan tanjiro", "stan izuku", "izuku and tanjiro are both good boys uwu", "anime of the YEAR", "the animation?", "art style??", "so mf good", "my crops are watered", "I have been BLESSED by the anime gods", "thanks for the food", "i ship deku and kacchan", "fite me", "NEZUKO IS BEST GIRL", "not to be dramatic, but would die for her", "protect her at all cost", "nezuko deserves the world", "crying", "ya'll can clown me but idc", "i'm fuji and weaboo trash butttt ther's so much good anime this season and i'm like????", "i dont have time bb", "su is also good", "have you SEEN the new movie??", "pink diamond is trash", "i hate rose, fuck her", "spinel is baby", "spinel deserves love", "um greg universe", "also the mermaid sisters are fine af", "fucking bullshit song goes hardddd", "they deserved to WIN DAMN IT", "watch carole and tuesday", "its also good btw", "it's on netflix, so no excuses bb"]}
        />
        <TagsGroup
          containerStyle={{alignSelf: 'center', marginBottom: 300}}
          containerWidth={screenWidth - 20}
          tags={["Demon slayer is lit", "kimetsu no yaiba is amazing", "i still love bhna thooo", "mha and kny are both good", "stan tanjiro", "stan izuku", "izuku and tanjiro are both good boys uwu", "anime of the YEAR", "the animation?", "art style??", "so mf good", "my crops are watered", "I have been BLESSED by the anime gods", "thanks for the food", "i ship deku and kacchan", "fite me", "NEZUKO IS BEST GIRL", "not to be dramatic, but would die for her", "protect her at all cost", "nezuko deserves the world", "crying", "ya'll can clown me but idc", "i'm fuji and weaboo trash butttt ther's so much good anime this season and i'm like????", "i dont have time bb", "su is also good", "have you SEEN the new movie??", "pink diamond is trash", "i hate rose, fuck her", "spinel is baby", "spinel deserves love", "um greg universe", "also the mermaid sisters are fine af", "fucking bullshit song goes hardddd", "they deserved to WIN DAMN IT", "watch carole and tuesday", "its also good btw", "it's on netflix, so no excuses bb"]}
        />
      </ScrollView>
    );
  }
};