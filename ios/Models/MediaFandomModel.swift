
import Foundation;
import SwiftSoup;

class MediaFandomItem : Codable {
  let mediaType: String      ; //ex: Anime & Manga, Movies & TV, etc.
  let mediaLink: String      ; //link to the fandom list for this media type
  let fandoms  : [FandomItem]; //fandoms that belong to this media type
  
  init?(elFandomCategory: Element) {
    //extract category name and link: ex: Anime and Manga
    (self.mediaLink, self.mediaType) = MediaFandomItem.getCategoryNameAndLink(elFandomCategory);
    //extract fandoms that belong to this category
    self.fandoms = MediaFandomItem.getFandomsFromCategory(elFandomCategory);
  };
  
  func printValues(){
    print("--------------------------------------");
    print("mediaType: \(mediaType)");
    print("mediaType: \(mediaLink)");
    
    for (index, fandom) in fandoms.enumerated() {
      print("  \(index) fandom item ---------------------");
      print("  fandom - fandomNames \(fandom.fandomNames)");
      print("  fandom - fandomLink  \(fandom.fandomLink )");
      print("  fandom - workCount   \(fandom.workCount  )");
    };
  
    print("---------------------------------------");
    print("\n\n\n");
  };
  
  static func getCategoryNameAndLink(_ elFandomCategory: Element) -> (String, String){
    guard
      //get parent element that holds the category name + link
      let elHeading: Elements = try? elFandomCategory.select("h3.heading"),
      
      //get contents of heading, which is a link tag
      let elLink: Element  = elHeading.first(),
      
      //make sure that element has children before getting 1st element
      let elCategoryLink: Element = (elLink.children().count > 0) ? elLink.child(0) : nil,
      
      //extract category url, ex: "/media/Anime%20*a*%20Manga/fandoms"
      let rawCategoryLink = try? elCategoryLink.attr("href"),
      
      //extract category text, ex: "Anime & Manga"
      let categoryName = try? elCategoryLink.text(),
      
      //get url prefix/base for categories, i.e "https://archiveofourown.org/media"
      let urlPrefix: URL = ScrapeCategories.url,
      
      //combine url prefix/root with fandom linkURL (i.e /Anime%20*a*%20Manga/fandoms, /Movies/fandoms etc.)
      let categoryLink: String = URL(string: rawCategoryLink, relativeTo: urlPrefix )?.absoluteString
      
    else {
      //unable to resolve category name and link
      print("debug - MediaFandomItem - extractMediaFandomList Error: Unable to extract category name/href");
      return ("" , "")
    };
    
    return (categoryLink, categoryName);
  };
  
  static func getFandomsFromCategory(_ elFandomCategory: Element) -> [FandomItem] {
    //get fandom group list: bhna (100), haikyuu (50), etc.
    guard let fandomList: Elements =
      try? elFandomCategory.select("ol.index.group").first()?.children()
      //nothing to select
      else { return [] };
    
    return fandomList.compactMap {(elFandom: Element) in
      guard
        //make sure that element has children before getting 1st element
        let elfandomLink: Element = (elFandom.children().count > 0) ? elFandom.child(0) : nil,
        //get raw linkText + link ex: "僕のヒーローアカデミア | Boku no Hero Academia | My Hero Academia (72596)"
        let (linkText, linkURL) = MediaFandomItem.getFandomTextAndLink(elfandomLink),
        //get url prefix for categories
        let urlPrefix: URL = ScrapeCategories.url,
        //combine url prefix/root with fandom linkURL (i.e "/tags/Naruto/works")
        let fandomLink: String = URL(string: linkURL, relativeTo: urlPrefix )?.absoluteString,
        //extract fandom work count, ex: "fandom (1000)" -> 1000
        let fandomCount: Int = MediaFandomItem.getFandomCount(elFandom)
     
      else {
        //skip item, early return
        print("debug - MediaFandomItem - getFandomsFromCategory Error: could not extract elfandomLink, skipping");
        return nil;
      };
      
      return FandomItem (
        //extract: fandom names from link element
        fandomNames: MediaFandomItem.getFandomNames(linkText),
        //pass down fandomLink
        fandomLink: fandomLink,
        //pass down fandom count
        workCount: fandomCount
      );
    };
  };
  
  private static func getFandomTextAndLink(_ elfandomLink: Element) -> (String, String)? {
    //get elemnents that holds the fandom name + link
    guard
      let fandomName: String  = try? elfandomLink.text(),
      let fandomLink: String  = try? elfandomLink.attr("href")
      
    else {
      print("debug - MediaFandomItem - getFandomTextAndLink Error: could not extract fandom text/link.");
      return nil;
    };
    
    return (fandomName, fandomLink);
  };
  
  private static func getFandomCount(_ elFandom: Element) -> Int? {
    guard
      //extract entire fandom link text: ex: Haikyuu!! (53653), Naruto (46096)
      let linkText: String = try? elFandom.text(),
      //get index start/edn pos of "(" and ")"
      let indexPrefix = linkText.lastIndex(of: "("),
      let indexSuffix = linkText.lastIndex(of: ")")
      
    else {
      //no "(" or ")" found, set fandomCount to 0
      print("debug - MediaFandomItem - extractMediaFandomList Error: could not extract fandomCount.");
      return 0;
    };
    
    //offset and extract string between "(" and ")"
    let prefixOffset = linkText.index(after: indexPrefix);
    let countString  = String(linkText[prefixOffset ..< indexSuffix]);
    
    //convert string to int
    return Int(countString);
  };
  
  private static func getFandomNames(_ linkText: String) -> [String] {
    //process: split fandom name by "|", ex: "BHNA | MHA", etc.
    var names = linkText.components(separatedBy: "|");
      
    //remove (1234), if it exists
    if let last = names.last, last.contains("(") || last.contains(")") {
      names.removeLast();
    };
    
    return names;
  };
};


