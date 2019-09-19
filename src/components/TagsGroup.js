import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { replacePropertiesWithNull } from '../functions/helpers';

export class TagsItem {
  static structure = {
    text : '',
    value: '',
    containerStyle: {},
    textStyle     : {},
  };

  static wrap(data = TagsItem.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...TagsItem.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(TagsItem.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [TagsItem.structure]){
    return items.map((item) => 
      TagsItem.wrap(item)
    );
  };
};

export class TagsGroup extends React.Component {
  static propTypes = {
    //required props
    tags          : PropTypes.array .isRequired, //TagsItem
    containerWidth: PropTypes.number.isRequired,
    //events
    onPressTag: PropTypes.func,
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

  createTagComp = (tagType = '', tagText = '', tagNumber = 0, tagIndex = 0) => {
    const { styles, TAG_TYPE } = TagsGroup;
    const { charSize, seperatorSize, innerPadding, tags, onPressTag, ...props } = this.props;
    const currentTag = TagsItem.wrap(tags[tagNumber]);
    
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
    
    const key          = `${tagIndex}-${tagText}`;
    const tagIDGroup   = `tagGroup-${tagNumber}`;
    const tagIDHandler = `onPressTag-${tagNumber}`;

    if(this[tagIDGroup] == undefined){
      //init and register to tag group
      this[tagIDGroup] = [key];

    } else {
      //add tag to tag group
      this[tagIDGroup].push(key);
    };

    if(this[tagIDHandler] == undefined){
      this[tagIDHandler] = () => {
        onPressTag && onPressTag(currentTag);
      };
    };

    const onPressIn = () => {
      const tagGroup = this[tagIDGroup];
      if(tagGroup.length > 1){
        tagGroup.forEach(tagRef => {
          const ref = this[tagRef];
          ref && ref.setOpacityTo(0.5, 100);
        });
      };
    };

    const onPressOut = () => {
      const tagGroup = this[tagIDGroup];
      if(tagGroup.length > 1){
        tagGroup.forEach(tagRef => {
          const ref = this[tagRef];
          ref && ref.setOpacityTo(1, 100);
        });
      };
    };
    
    return(
      <TouchableOpacity 
        key={`tagContainer-${key}`}
        ref={r => this[key] = r}
        style={[styles.tagContainer, props.tagContainerStyle, {...borderStyle, ...sharedContainerStyles}, currentTag.containerStyle]}
        onPress={this[tagIDHandler]}
        {...{onPressIn, onPressOut}}
      >
        <Text
          key={`tagText-${key}`}
          style={[styles.tagText, styles.tagTextStyle, {fontSize: charSize}, currentTag.textStyle]}
        >
          {tagText}
        </Text>
      </TouchableOpacity>
    );
  };

  createTags = () => {
    const { styles, TAG_TYPE } = TagsGroup;
    const { tags: _tags, charSize, containerWidth, ...props } = this.props;

    //wrap and create copy of tags
    const tagsCopy = TagsItem.wrapArray([..._tags]);
    //extract text from tags
    const tags = tagsCopy.map(tag => tag.text);

    const charWidth = (charSize / 1.5);
    
    //init with containerWidth prop
    let remainingWidth = containerWidth;
    
    let tagIndex  = -1; //count how many iteration
    let tagNumber = -1; //which is the current tag in tags prop

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
          
        if(nextTagType == TAG_TYPE.FULL){
          //new tag added
          tagNumber++;
        };

        remainingWidth -= textWidth;
        tagTypes.push(nextTagType);
        compCols.push(
          this.createTagComp(nextTagType, tag, tagNumber, ++tagIndex)
        );

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

        if(nextTagType == TAG_TYPE.LEFT){
          //new tag added
          tagNumber++;
        };
        
        if(nextTagType == null) {
          //null means skip, re-add to tags list
          tags.unshift(tag);          
          //reset remaining
          remainingWidth = 0;

        } else {
          tagTypes.push(nextTagType);
          compCols.push(
            this.createTagComp(nextTagType, textThatFits, tagNumber, ++tagIndex)
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