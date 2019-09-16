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
  static func extractMediaFandomList(html: String, urlSource: String) -> [MediaFandomItem]? {
    let urlPrefix = URL(string: urlSource);
    
    guard
      //try and parse given html
      let document: Document = try? SwiftSoup.parse(html),
      //get the list parent that holds all the categories
      let categoryContainer: Elements = try? document.select("ul.media.fandom.index.group"),
      //li of categories - ex: Anime & Manga, Cartoons & Comics, etc.
      let fandomCategories: Elements = categoryContainer.first()?.children()
      
      else {
        //nothing to select, early return
        print("AO3HTMLParser - extractMediaFandomList Error: Unable to parse given html");
        return nil
    };
    
    
    
    return fandomCategories.array().compactMap { (fandomCategory: Element) in
      //extract category name and link: ex: Anime and Manga
      let (categoryHref, categoryName): (String, String) = {
        guard
          //get parent element that holds the category name + link
          let elHeading: Elements = try? fandomCategory.select("h3.heading"),
          //get contents of heading, which is a link tag
          let elLink: Element  = elHeading.first(),
          //make sure that element has children before accessing 1st element
          let categoryLink: Element = (elLink.children().count > 0) ? elLink.child(0) : nil
          
          else {
            //unable to resolve category name and link
            print("AO3HTMLParser - extractMediaFandomList Error: Unable to extract category name/href");
            return ("" , "")
        };
        
        return (
          //extract and return name + link
          (try? categoryLink.attr("href")) ?? "",
          (try? categoryLink.text()      ) ?? ""
        );
      }();
      
      //get fandom group list: bhna (100), haikyuu (50), etc.
      guard let fandomList: Elements =
        try? fandomCategory.select("ol.index.group").first()?.children()
        //nothing to select, skip item/goto next element
        else { return nil };
      
      let fandomItem: [FandomItem] = fandomList.compactMap {(elFandom: Element) in
        do {
          //get elemnents that holds the fandom name + link
          let elfandomLink: Element = elFandom.child(0);
          let linkText    : String  = try elFandom.text();
          
          //extract fandom work count, ex: "fandom (1000)"
          let fandomCount: Int = {
            guard
              let indexPrefix = linkText.lastIndex(of: "("), // get index of "("
              let indexSuffix = linkText.lastIndex(of: ")")  // get index of ")"
              
              else {
                print("AO3HTMLParser - extractMediaFandomList Error: could not extract fandomCount.");
                //no "(" or ")" found, set fandomCount to 0
                return 0;
            };
            
            //offset and extract string between "(" and ")"
            let prefixOffset = linkText.index(after: indexPrefix);
            let countString  = String(linkText[prefixOffset ..< indexSuffix]);
            
            //convert string to int
            return Int(countString) ?? 0;
          }();
          
          return FandomItem (
            //extract: fandom names from link element
            fandomNames: {
              //extract fandom name as text from link element
              guard let rawFandomName : String = try? elfandomLink.text() else { return [""] };
              //process: split fandom name by "|", ex: "BHNA | MHA", etc.
              return rawFandomName.components(separatedBy: "|");
          }(),
            //extract: link attr as string
            fandomLink: {
              guard let suffix = try? elfandomLink.attr("href") else { return "" };
              return URL(string: suffix, relativeTo: urlPrefix )?.absoluteString ?? "";
          }(),
            //pass down fandom count
            workCount: fandomCount
          );
          
        } catch {
          //parsing went wrong, skip/omit from map
          return nil;
        };
      };
      
      return MediaFandomItem(
        mediaType: categoryName,
        mediaLink: categoryHref,
        fandoms  : fandomItem
      );
    };
  };
  
  static func extractWorkList(html: String) -> [WorkItem]? {
    let urlPrefix = URL(string: "");
    
    guard
      //try and parse given html
      let document: Document = try? SwiftSoup.parse(html),
      //get the list ul parent that holds all the fics
      let elWorkListContainer: Elements = try? document.select("ol.work.index.group"),
      //li elements that hold the fics
      let elWorkList: Elements = elWorkListContainer.first()?.children()
      
      else {
        //nothing to select, early return
        print("AO3HTMLParser - extractWorkList Error: Unable to parse given html");
        return nil
    };
    
    return elWorkList.array().compactMap {
      WorkItem(elWorkItem: $0)
    };
  };
};
