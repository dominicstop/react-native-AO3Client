
import Foundation;
import WKZombie;
import SwiftSoup;


enum ContentRating: String, CaseIterable, Codable {
  case notRated  = "Not Rated";
  case general   = "General Audiences";
  case teenAndUp = "Teen And Up Audiences";
  case mature    = "Mature";
  case explicit  = "Explicit";
  case unknown   = "";
  
  static func withLabel(_ label: String) -> ContentRating? {
    return self.allCases.first{ "\($0)" == label }
  };
};

enum ContentWarnings: String, CaseIterable, Codable {
  case chooseNoWarnings    = "Choose Not To Use Archive Warnings";
  case noWarningsApply     = "No Archive Warnings Apply";
  case graphicViolence     = "Graphic Depictions Of Violence";
  case majorCharacterDeath = "Major Character Death";
  case underage            = "Underage";
  case rapeNonCon          = "Rape/Non-Con";
  case unknown             = "";
  
  static func withLabel(_ label: String) -> ContentWarnings? {
    return self.allCases.first{ "\($0)" == label }
  };
};

enum ContentPairingType: String, CaseIterable, Codable {
  case general  = "Gen";
  case multi    = "Multi";
  case straight = "F/M";
  case gay      = "M/M";
  case lesbian  = "F/F";
  case other    = "Other";
  case unknown  = "";
  
  static func withLabel(_ label: String) -> ContentPairingType? {
    return self.allCases.first{ "\($0)" == label }
  };
};

enum ContentWipStatus: String, CaseIterable, Codable {
  case general = "Work in Progress";
  case multi   = "Complete Work";
  case unknown = "";
  
  static func withLabel(_ label: String) -> ContentWipStatus? {
    return self.allCases.first{ "\($0)" == label }
  };
};

struct MediaFandomItem {
  let mediaType: String      ; //ex: Anime & Manga, Movies & TV, etc.
  let mediaLink: String      ; //link to the fandom list for this media type
  let fandoms  : [FandomItem]; //fandoms that belong to this media type
};

struct FandomItem : Codable {
  let fandomNames: [String]; //other names, ex: BHNA, MHA, etc.
  let fandomLink : String  ; //link to the work list that belong to this fandom
  let workCount  : Int     ; //number of works that are in this fandom
};

struct Relationship : Codable {
  let pairing   : String  ; //ex: "Midoriya Izuku x Bakugou Katsuki"
  let link      : String  ; //ex: "/tags/Midoriya%20Izuku*s*Todoroki%20Shouto/works"
  let isPlatonic: Bool    ; //ex: false
  let characters: [String]; //ex: ["Midoriya Izuku", "Bakugou Katsuki"]
};

struct Tag : Codable {
  let name: String; // ex: "Coffee Shop AU", "fluff", etc.
  let link: String; // ex: "/tags/Smitten%20Todoroki%20Shouto/works"
};

struct ChapterCount : Codable {
  let chapterText : String; // raw extracted text
  let chapterCount: Int   ; // available chapters: ex: 1
  let chapterTotal: Int   ; // total chapters: 0 means unknown
};

class WorkItem : Codable {
  //work details/info
  let workID    : String;
  let workTitle : String;
  let workLink  : String;
  let authorName: String;
  let authorLink: String;
  let fandomName: String;
  let fandomLink: String;
  
  //content
  let contentRating     : ContentRating;
  let contentWarnings   : [ContentWarnings];
  let contentPairingType: [ContentPairingType];
  let contentWipStatus  : ContentWipStatus;
  
  //tags
  let relationships  : [Relationship];
  let tagsfreeforms  : [Tag];
  let tagsCharacters : [Tag];
  let hasBGCharacters: Bool;
  
  let dateUpdated: String;
  let summary    : [String];
  
  //work stats
  let language     : String;
  let wordCount    : Int;
  let chapterCount : ChapterCount;
  let commentsCount: Int;
  let commentsLink : String;
  let kudosCount   : Int;
  let kudosLink    : String;
  let hitsCount    : Int;
  
  init?(elWorkItem: Element) {
    guard
      //get the container element that holds the work title/author
      let elHeader: Element = try? elWorkItem.select("h4.heading").first(),
      //get the container element that holds the work content warnings/rating/rels/wip
      let elRequiredTags: Element = try? elWorkItem.select("ul.required-tags").first(),
      //get the container element that holds the work tags
      let elTagsContainer: Element = try? elWorkItem.select("ul.tags.commas").first(),
      //get the container detail list element that holds all the work details
      let elDetailsContainer: Element = try? elWorkItem.select("dl.stats").first()
      
      else {
        print("AO3HTMLParser - extractWorkList Error: Unable to extract header element");
        //no link element to extract
        return nil;
    };
    
    self.workID = (try? elWorkItem.attr("id")) ?? "";
    
    (self.workTitle , self.workLink  ) = WorkItem.getWorkTitleAndLink (elHeader  );
    (self.authorName, self.authorLink) = WorkItem.getAuthorAndLink    (elHeader  );
    (self.fandomName, self.fandomLink) = WorkItem.getFandomNameAndLink(elWorkItem);
    
    self.contentRating      = WorkItem.getRatings     (elRequiredTags);
    self.contentWarnings    = WorkItem.getWarnings    (elRequiredTags);
    self.contentPairingType = WorkItem.getPairingTypes(elRequiredTags);
    self.contentWipStatus   = WorkItem.getWipStatus   (elRequiredTags);
    
    self.summary     = WorkItem.getSummary   (elWorkItem);
    self.dateUpdated = WorkItem.getUpdateDate(elWorkItem);
    
    self.tagsCharacters = WorkItem.getCharacters  (elTagsContainer);
    self.tagsfreeforms  = WorkItem.getTagFreeforms(elTagsContainer);
    
    (self.relationships, self.hasBGCharacters) = WorkItem.getRelationships       (elTagsContainer   );
    (self.commentsCount, self.commentsLink   ) = WorkItem.getCommentsCountAndLink(elDetailsContainer);
    (self.kudosCount   , self.kudosLink      ) = WorkItem.getKudosAndLink        (elDetailsContainer);
    
    self.language     = WorkItem.getLanguage    (elDetailsContainer);
    self.wordCount    = WorkItem.getWordCount   (elDetailsContainer);
    self.hitsCount    = WorkItem.getHitsCount   (elDetailsContainer);
    self.chapterCount = WorkItem.getChapterCount(elDetailsContainer);
  };
  
  func printValues(){
    print("--------------------------------------");
    print("workID    : \(workID    )");
    print("workTitle : \(workTitle )");
    print("workLink  : \(workLink  )");
    print("authorName: \(authorName)");
    print("authorLink: \(authorLink)");
    print("fandomName: \(fandomName)");
    print("fandomLink: \(fandomLink)");
    
    print("contentRating     : \(contentRating     )");
    print("contentWarnings   : \(contentWarnings   )");
    print("contentPairingType: \(contentPairingType)");
    print("contentWipStatus  : \(contentWipStatus  )");
    print("contentRating     : \(contentRating     )");
    
    print("relationships : \(relationships )");
    print("tagsCharacters: \(tagsCharacters)");
    print("tagsfreeforms : \(tagsfreeforms )");
    
    print("summary          : \(summary          )");
    print("language         : \(language         )");
    print("wordCount        : \(wordCount        )");
    print("chapterCount     : \(chapterCount     )");
    print("commentCount     : \(commentsCount    )");
    print("commentsLink     : \(commentsLink     )");
    print("kudosCount       : \(kudosCount       )");
    print("kudosLink        : \(kudosLink        )");
    print("hitsCount        : \(hitsCount        )");
    print("---------------------------------------");
    print("\n\n\n");
  };
  
  //get work/fic's work name + link
  static func getWorkTitleAndLink(_ elHeader: Element) -> (String, String) {
    guard let elWorkLink: Element = (elHeader.children().count > 0) ? elHeader.child(0) : nil else {
      print("AO3HTMLParser - extractWorkList Error: Unable to extract fic title/link");
      //no header element, skip/goto next item
      return ("", "");
    };
    
    return(
      //extract work title + link as text
      (try? elWorkLink.text()      ) ?? "",
      (try? elWorkLink.attr("href")) ?? ""
    );
  };
  
  //get work/fic's author name + link
  static func getAuthorAndLink(_ elHeader: Element) -> (String, String) {
    guard let elAuthorLink: Element = (elHeader.children().count > 1) ? elHeader.child(1) : nil else {
      print("AO3HTMLParser - extractWorkList Error: Unable to extract work author/link");
      //no link element to extract
      return ("", "");
    };
    
    return(
      //extract work author + link as text
      (try? elAuthorLink.text()      ) ?? "",
      (try? elAuthorLink.attr("href")) ?? ""
    );
  };
  
  //get work/fic's fandom name + link
  static func getFandomNameAndLink(_ elWorkItem: Element) -> (String, String) {
    guard
      //get the element the parent element that holds the fandom name/link element
      let elFandomsHeader: Element = try? elWorkItem.select("h5.fandoms.heading").first(),
      //get the actual element that holds the fandom name/link element
      let elFandomsLink: Element = try? elFandomsHeader.select("a.tag").first(),
      //extract work fandom name + link as text
      let text = try? elFandomsLink.text(),
      let link = try? elFandomsLink.attr("href")
      else {
        print("AO3HTMLParser - extractWorkList Error: Unable to extract fandoms name + link.");
        //no link element to extract
        return ("", "");
    };
    return(text, link);
  };
  
  //content required tags - extract rating
  static func getRatings(_ elRequiredTags: Element) -> ContentRating {
    guard
      //get container/parent that holds the rating
      let elRatingContainer: Element = try? elRequiredTags.select("span.rating").first(),
      //get the span child element that has the rating text
      let elRating: Element = try? elRatingContainer.select("span.text").first(),
      //extract rating text from span
      let rating: String = try? elRating.text()
      else {
        print("AO3HTMLParser - extractWorkList Error: Unable to extract archive warnings: rating");
        return .unknown;
    };
    //if theres's no matching enum, return unknown
    return ContentRating(rawValue: rating) ?? .unknown;
  };
  
  //content required tags - extract rating
  static func getWarnings(_ elRequiredTags: Element) -> [ContentWarnings] {
    guard
      //get container/parent that holds the warnings
      let elWarningsContainer: Element = try? elRequiredTags.select("span.warnings").first(),
      //get the span child element that has the warnings text
      let elWarning: Element = try? elWarningsContainer.select("span.text").first(),
      //extract rating text from span
      let rawWarningText: String = try? elWarning.text()
      else {
        print("AO3HTMLParser - extractWorkList Error: Unable to extract archive warnings: rating");
        return [ContentWarnings]();
    };
    
    //convert to array of strings seperated by ","
    let warnings: [String] = rawWarningText.components(separatedBy: ",");
    //map warnings with thier matching ContentWarnings enum case
    return warnings.map {
      //if theres's no matching enum, return unknown
      ContentWarnings(rawValue: $0) ?? .unknown
    };
  };
  
  //content required tags - extract relationships
  static func getPairingTypes(_ elRequiredTags: Element) -> [ContentPairingType] {
    guard
      //get container/parent that holds the relationships
      let elRelationshipsContainer: Element = try? elRequiredTags.select("span.category").first(),
      //get the span child element that has the relationships text
      let elRelationships: Element = try? elRelationshipsContainer.select("span.text").first(),
      //extract rating text from span
      let rawRelationshipsText: String = try? elRelationships.text()
      else {
        print("AO3HTMLParser - extractWorkList Error: Unable to extract archive warnings: relationships");
        //return .unknown;
        return [ContentPairingType]();
    };
    
    //convert to array of strings seperated by ","
    let relationships: [String] = rawRelationshipsText.components(separatedBy: ",");
    //map warnings with thier matching ContentWarnings enum case
    return relationships.map {
      //if theres's no matching enum, return unknown
      ContentPairingType(rawValue: $0) ?? .unknown
    };
  };
  
  //content required tags - extract rating
  static func getWipStatus(_ elRequiredTags: Element) -> ContentWipStatus {
    guard
      //get container/parent that holds the wip status
      let elStatusContainer: Element = try? elRequiredTags.select("span.iswip").first(),
      //get the span child element that has the wip status text
      let elStatus: Element = try? elStatusContainer.select("span.text").first(),
      //extract wip status text from span
      let statusText: String = try? elStatus.text(),
      //match text with enum equivalent
      let status = ContentWipStatus(rawValue: statusText)
      else {
        print("AO3HTMLParser - extractWorkList Error: Unable to extract archive warnings: wip status");
        return .unknown;
    };
    return status;
  };
  
  //get the fics update date
  static func getUpdateDate(_ elWorkItem: Element) -> String {
    return (try? elWorkItem.select("p.datetime").first()?.text()) ?? "";
  };
  
  //tags - extract fic relationships
  static func getRelationships(_ elTagsContainer: Element) -> ([Relationship], Bool){
    guard
      //get container/parent that holds the relationships
      let elRelationships: Elements = try? elTagsContainer.select("li.relationships"),
      //make sure that there's at least one element
      (elRelationships.count > 0)
      else {
        print("AO3HTMLParser - extractWorkList Error: Unable to extract relationships.");
        return ([Relationship](), false);
    };
    
    var hasMinorOrBGRelationships = false;
    let relationships: [Relationship] = elRelationships.compactMap { (elRelationship: Element) in
      guard
        let elLink = try? elRelationship.select("a.tag"),
        let text = try? elLink.text(),
        let link = try? elLink.attr("href")
        else {
          print("AO3HTMLParser - extractWorkList Error: Unable to extract relationship item");
          //skip/goto next item
          return nil;
      };
      
      if(text == "Minor or Background Relationship(s)"){
        hasMinorOrBGRelationships = true;
        //skip/goto next item
        return nil;
        
      } else {
        let isPlatonic: Bool     = text.contains("&");
        let characters: [String] = text.components(
          separatedBy: isPlatonic ? "&" : "/"
        );
        
        return Relationship(
          pairing   : text,
          link      : link,
          isPlatonic: isPlatonic,
          characters: characters
        );
      };
    };
    
    return (relationships, hasMinorOrBGRelationships);
  };
  
  //tags - extract characters
  static func getCharacters(_ elTagsContainer: Element) -> [Tag] {
    guard
      //get container/parent that holds the chars.
      let elCharacters: Elements = try? elTagsContainer.select("li.characters"),
      //make sure that there's at least one element
      (elCharacters.count > 0)
      else {
        print("AO3HTMLParser - extractWorkList Error: Unable to extract characters.");
        return [Tag]();
    };
    
    return elCharacters.compactMap { (elCharacter: Element) in
      guard
        let elLink = try? elCharacter.select("a.tag"),
        //extract link text + link
        let text = try? elLink.text(),
        let link = try? elLink.attr("href")
        else {
          print("AO3HTMLParser - extractWorkList Error: Unable to extract char item");
          //skip/goto next item
          return nil;
      };
      
      return Tag(
        name: text,
        link: link
      );
    };
  };
  
  //tags - extract freeform/misc tags
  static func getTagFreeforms(_ elTagsContainer: Element) -> [Tag] {
    guard
      //get container/parent that holds the freeform tags.
      let elFreeforms: Elements = try? elTagsContainer.select("li.freeforms"),
      //make sure that there's at least one element
      (elFreeforms.count > 0)
      else {
        print("AO3HTMLParser - extractWorkList Error: Unable to extract elFreeform tags.");
        return [Tag]();
    };
    
    return elFreeforms.compactMap { (elFreeform: Element) in
      guard
        let elLink = try? elFreeform.select("a.tag"),
        //extract link text + link
        let text = try? elLink.text(),
        let link = try? elLink.attr("href")
        else {
          print("AO3HTMLParser - extractWorkList Error: Unable to extract freeform tag item");
          //skip/goto next item
          return nil;
      };
      
      return Tag(
        name: text,
        link: link
      );
    };
  };
  
  //get work's summary
  static func getSummary(_ elWorkItem: Element) -> [String] {
    guard
      //get container/parent that holds the freeform tags.
      let elSummaryContainer: Element = try? elWorkItem.select("blockquote.userstuff.summary").first(),
      //get all the child paragraph elements, make sure that there's at least one element
      let elSummaries: Elements = (elSummaryContainer.children().count > 0) ? elSummaryContainer.children() : nil
      else {
        print("AO3HTMLParser - extractWorkList Error: Unable to extract summary.");
        return [String]();
    };
    //map p elements to string array
    return elSummaries.compactMap { try? $0.text() };
  };
  
  //stats - get work's language
  static func getLanguage(_ elDetailsContainer: Element) -> String {
    //get container/parent that holds the freeform tags.
    guard let elLanguage: Element = try? elDetailsContainer.select("dd.language").first() else {
      print("AO3HTMLParser - extractWorkList Error: Unable to extract language.");
      return "";
    };
    //extract text from detail
    return (try? elLanguage.text()) ?? "";
  };
  
  //stats - get work word count
  static func getWordCount(_ elDetailsContainer: Element) -> Int {
    guard
      //get container/parent that holds the freeform tags.
      let elWordCount: Element = try? elDetailsContainer.select("dd.words").first(),
      //extract word count from detail as text
      let rawWordCount = try? elWordCount.text()
      else {
        print("AO3HTMLParser - extractWorkList Error: Unable to extract word count.");
        return 0;
    };
    
    //remove "," in wordCount, ex: "1,103"
    let wordCountText: String = rawWordCount.split(separator: ",").joined();
    //parse as Int
    return Int(wordCountText) ?? 0;
  };
  
  //stats - get work word count
  static func getChapterCount(_ elDetailsContainer: Element) -> ChapterCount {
    guard
      //get container/parent that holds the freeform tags.
      let elChapter: Element = try? elDetailsContainer.select("dd.chapters").first(),
      //extract word count from detail as text
      let rawChapterText = try? elChapter.text()
      else {
        print("AO3HTMLParser - extractWorkList Error: Unable to extract chapter count.");
        return ChapterCount(chapterText: "", chapterCount: 0, chapterTotal: 0);
    };
    
    //split by "/", ex: "1/2" to ["1", "2"];
    let chapterTexts = rawChapterText.split(separator: "/");
    
    if chapterTexts.count == 2 {
      return ChapterCount(
        chapterText: rawChapterText,
        //convert chapters to int
        chapterCount: Int(chapterTexts[0]) ?? 0,
        chapterTotal: Int(chapterTexts[1]) ?? 0
      );
      
    } else {
      print("AO3HTMLParser - extractWorkList Error: malformed chapter count.");
      return ChapterCount(chapterText: "", chapterCount: 0, chapterTotal: 0);
    };
  };
  
  //stats - get work's comment + link to comments
  static func getCommentsCountAndLink(_ elDetailsContainer: Element) -> (Int, String) {
    guard
      //get container/parent that holds the comment tags.
      let elCommentContainer: Element = try? elDetailsContainer.select("dd.comments").first(),
      //get link element that holds the comment count + link
      let elComment: Element = try? elCommentContainer.getElementsByTag("a").first(),
      //extract text + link as string
      let commentText: String = try? elComment.text(),
      let commentLink: String = try? elComment.attr("href")
      else {
        print("AO3HTMLParser - extractWorkList Error: Unable to extract comment count.");
        return (0, "");
    };
    
    return (
      Int(commentText) ?? 0,
      commentLink
    );
  };
  
  //stats - get work's kudos count + link to kudos
  static func getKudosAndLink(_ elDetailsContainer: Element) -> (Int, String) {
    guard
      //get container/parent that holds the kudos tags.
      let elKudosContainer: Element = try? elDetailsContainer.select("dd.kudos").first(),
      //get link element that holds the kudos count + link
      let elKudos: Element = try? elKudosContainer.getElementsByTag("a").first(),
      //extract text + link as string
      let kudosText: String = try? elKudos.text(),
      let kudosLink: String = try? elKudos.attr("href")
      else {
        print("AO3HTMLParser - extractWorkList Error: Unable to extract kudos count.");
        return (0, "");
    };
    
    return (
      Int(kudosText) ?? 0,
      kudosLink
    );
  };
  
  //stats - get work hit count
  static func getHitsCount(_ elDetailsContainer: Element) -> Int {
    guard
      //get container/parent that holds the hits count.
      let elHitsCount: Element = try? elDetailsContainer.select("dd.hits").first(),
      //extract hits count from detail as text
      let rawHitsCount: String = try? elHitsCount.text()
      else {
        print("AO3HTMLParser - extractWorkList Error: Unable to extract hits count.");
        return 0;
    };
    
    //parse as Int
    return Int(rawHitsCount) ?? 0;
  };
};
