//
//  AO3HTMLParser.swift
//  AO3Client
//
//  Created by Dominic Go on 17/09/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

import Foundation
import SwiftSoup

class AO3HTMLParser {
  static func extractMediaFandomList(html: String) -> [MediaFandomItem]? {
    guard
      //try and parse given html
      let document: Document = try? SwiftSoup.parse(html),
      //get the list parent that holds all the categories
      let categoryContainer: Elements = try? document.select("ul.media.fandom.index.group"),
      //li of categories - ex: Anime & Manga, Cartoons & Comics, etc.
      let fandomCategories: Elements = categoryContainer.first()?.children()
    else {
      //nothing to select, early return
      print("debug - AO3HTMLParser - extractMediaFandomList Error: Unable to parse given html");
      return nil;
    };
    
    return fandomCategories.array().compactMap { (elFandomCategory: Element) in
      MediaFandomItem(elFandomCategory: elFandomCategory);
    };
  };
  
  static func extractWorkList(html: String) -> [WorkItem]? {
    guard
      //try and parse given html
      let document: Document = try? SwiftSoup.parse(html),
      //get the list ul parent that holds all the fics
      let elWorkListContainer: Elements = try? document.select("ol.work.index.group"),
      //li elements that hold the fics
      let elWorkList: Elements = elWorkListContainer.first()?.children()
      
    else {
      //nothing to select, early return
      print("debug - AO3HTMLParser - extractWorkList Error: Unable to parse given html");
      return nil;
    };
    
    return elWorkList.array().compactMap {
      WorkItem(elWorkItem: $0)
    };
  };
};
