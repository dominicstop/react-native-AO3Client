import { replacePropertiesWithNull } from '../functions/helpers';

export const EmumContentRating = {
  notRated : "Not Rated"            ,
  general  : "General Audiences"    ,
  teenAndUp: "Teen And Up Audiences",
  mature   : "Mature"               ,
  explicit : "Explicit"             ,
  unknown  : ""                     ,
};

export const EmumContentWarnings = {
  chooseNoWarnings   : "Choose Not To Use Archive Warnings",
  noWarningsApply    : "No Archive Warnings Apply"         ,
  graphicViolence    : "Graphic Depictions Of Violence"    ,
  majorCharacterDeath: "Major Character Death"             ,
  underage           : "Underage"                          ,
  rapeNonCon         : "Rape/Non-Con"                      ,
  unknown            : ""                                  ,
};

export const EmumContentPairingType = {
  general : "Gen"  ,
  multi   : "Multi",
  straight: "F/M"  ,
  gay     : "M/M"  ,
  lesbian : "F/F"  ,
  other   : "Other",
  unknown : ""     ,
};

export const EmumContentWipStatus = {
  general: "Work in Progress",
  multi  : "Complete Work"   ,
  unknown: ""                ,
};

export class Tags {
  static structure = {
    link: '',
    name: '',
  };

  static wrap(data = Tags.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...Tags.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(Tags.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [Tags.structure]){
    return items.map((item) => 
      Tags.wrap(item)
    );
  };
};

export class Relationships {
  static structure = {
    pairing   : ''   , //ex: "Midoriya Izuku x Bakugou Katsuki"
    link      : ''   , //ex: "/tags/Midoriya%20Izuku*s*Todoroki%20Shouto/works"
    isPlatonic: false, //ex: false
    characters: [''] , //ex: ["Midoriya Izuku", "Bakugou Katsuki"]
  };

  static wrap(data = Relationships.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...Relationships.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(Relationships.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [Relationships.structure]){
    return items.map((item) => 
      Relationships.wrap(item)
    );
  };
};

export class ChapterCount {
  static structure = {
    chapterCount: 0,
    chapterTotal: 0,
    chapterText : ''
  };

  static wrap(data = ChapterCount.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...ChapterCount.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(ChapterCount.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [ChapterCount.structure]){
    return items.map((item) => 
      ChapterCount.wrap(item)
    );
  };
};

export class WorkItem {
  static structure = {
    //work details/info
    workID     : '',
    workTitle  : '',
    workLink   : '',
    authorName : '',
    authorLink : '',
    fandomLink : '',
    fandomName : '',
    summary    : [''],
    dateUpdated: '',
    //content
    contentRating     : ''  ,
    contentWarnings   : [''],
    contentPairingType: [''],
    contentWipStatus  : ''  ,
    //tags
    relationships  : [Relationships.structure],
    tagsfreeforms  : [Tags.structure         ],
    tagsCharacters : [Tags.structure         ],
    hasBGCharacters: false                    ,
    //work stats
    language     : '',
    wordCount    : 0 ,
    commentsCount: 0 ,
    commentsLink : '',
    kudosCount   : 0 ,
    kudosLink    : '',
    hitsCount    : 0 ,
    chapterCount : ChapterCount.structure,
  };

  static wrap(data = WorkItem.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...WorkItem.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(WorkItem.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [WorkItem.structure]){
    return items.map((item) => 
      WorkItem.wrap(item)
    );
  };
};