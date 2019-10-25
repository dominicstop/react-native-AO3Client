import { replacePropertiesWithNull } from '../functions/helpers';

export class MediaCategoryFandom {
  static structure = {
    fandomLink : '', //ex: "../tags/Haikyuu!!/works"
    fandomNames: '', //ex: ["僕のヒーローアカデミア ", " Boku no Hero Academia ", " My Hero Academia"]
    workCount  : 0 , //number of works in this fandom
  };

  static wrap(data = MediaCategoryFandom.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...MediaCategoryFandom.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(MediaCategoryFandom.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [MediaCategoryFandom.structure]){
    return items.map((item) => 
      MediaCategoryFandom.wrap(item)
    );
  };
};

export class MediaCategory {
  static structure = {
    mediaType: '', //ex: "Anime & Manga"
    mediaType: '', //ex: ".../media/Anime%20*a*%20Manga/fandoms"
    fandoms  : [MediaCategoryFandom.structure],
  };

  static wrap(data = MediaCategory.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...MediaCategory.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(MediaCategory.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [MediaCategory.structure]){
    return items.map((item) => 
      MediaCategory.wrap(item)
    );
  };
};