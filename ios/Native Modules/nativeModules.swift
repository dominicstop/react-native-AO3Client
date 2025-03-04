// Expose Swift Modules to Objective-C and export them to react native
// Swift -> Obj-C -> React Native -> JS

import Foundation
import WKZombie;
import SwiftSoup;


@objc(HeadlessBrowser)
class HeadlessBrowser: NSObject {
  let browser: WKZombie!;
  
  override init(){
    self.browser = WKZombie.sharedInstance;
  };
  
  static func convertDataToString(data: Data?) -> String {
    if let unwrapData = data {
      let htmlString = NSString(data: unwrapData, encoding: String.Encoding.utf16.rawValue)!;
      return htmlString as String;
      
    } else {
      return "";
    };
  };
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  };
  
  @objc func getWebpage(
    _        urlStr : String                          ,
    resolver resolve: @escaping RCTPromiseResolveBlock, //call when success
    rejecter reject : @escaping RCTPromiseRejectBlock   //call when error/fail
  ) -> Void {
    
    let url = URL(string: urlStr);
    let action: Action<HTMLPage> = browser.open(url!);
    
    //load webpage
    action.start { result in
      switch result {
      case .success(let page):
        //convert html data to string
        let htmlString = HeadlessBrowser.convertDataToString(data: page.data);
        //pass value to js
        resolve(htmlString);
        
      case .error(let error):  // handle error
        print("getWebpage failed: \(urlStr)");
        print("action debug desc: \(error.debugDescription)");
        reject(
          "FETCH_ERROR",
          "Unable to retrieve: \(urlStr), error: \(error.debugDescription)",
          nil
        );
      };
    };
  };
};

@objc(AO3Scraper)
class AO3Scraper: NSObject {
  enum Links: String {
    case FANDOM_MEDIA_LIST = "https://archiveofourown.org/media";
  };
  
  static func convertDataToString(data: Data) -> String {
    let htmlString = NSString(data: data, encoding: String.Encoding.utf8.rawValue)!;
    return "\(htmlString)";
  };
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return false;
  };
  
  @objc func getFandomMediaCategories(
    _        resolve: @escaping RCTPromiseResolveBlock, //call when success
    rejecter reject : @escaping RCTPromiseRejectBlock   //call when error/fail
  ) -> Void {
  
    ScrapeCategories.getCategories { result in
      switch result {
      case .success(let mediaFandomCategories):
        do {
          //serialize to json string
          let jsonEncoder = JSONEncoder();
          let jsonData    = try jsonEncoder.encode(mediaFandomCategories);
          let jsonString  = String(data: jsonData, encoding: .utf8)!;
           
          //pass value to js
          resolve(jsonString);
           
        } catch {
          print("debug - getFandomMediaCategories action debug desc: \(error)");
          reject(
            "PARSE_ERROR",
            "getFandomMediaCategories Error: unable to parse to json: \(error)",
            nil
          );
        };
        break;
        
      case .failure(let error):
        print("debug - getFandomMediaCategories action debug desc: \(error)");
        reject(
          "PARSE_ERROR",
          "getFandomMediaCategories Error: unable to fetch media fandom caregories: \(error)",
          nil
        );
        break;
      };
    };
  };
  
  @objc func getWorksFromURL(
    _        urlStr : String                          ,
    resolver resolve: @escaping RCTPromiseResolveBlock, //call when success
    rejecter reject : @escaping RCTPromiseRejectBlock   //call when error/fail
  ) -> Void {
    
    let url: URL! = URL(string: urlStr);
    let browser: WKZombie = WKZombie.sharedInstance;
    let action: Action<HTMLPage> = browser.open(url);
    
    print("getWorksFromURL - received url: \(urlStr)");
    
    
    //load webpage
    action.start { result in
      switch result {
      case .success(let page):
        //convert html data to string
        let htmlString = AO3Scraper.convertDataToString(data: page.data!);
        let works      = AO3HTMLParser.extractWorkList(html: htmlString);
        
        do {
          let jsonEncoder = JSONEncoder();
          let jsonData    = try jsonEncoder.encode(works);
          let jsonString  = String(data: jsonData, encoding: .utf8)!;
          
          //pass value to js
          resolve(jsonString);
          
        } catch {
          print("getWorksFromURL failed: \(urlStr)");
          print("getWorksFromURL action debug desc: \(error)");
          reject(
            "FETCH_ERROR",
            "getWorksFromURL Error: Unable to works from: \(urlStr), error: \(error)",
            nil
          );
        };
        
      case .error(let error):  // handle error
        print("getWorkList Fetch Error: \(error.debugDescription)");
        reject(
          "FETCH_ERROR",
          "getWorksFromURL Error: Unable to works from: \(urlStr), error: \(error)",
          nil
        );
      };
    };
  };
};

@objc(MeasureText)
class MeasureText: NSObject {
  static let weightMap = [
    "normal": UIFont.Weight.regular   ,
    "bold"  : UIFont.Weight.bold      ,
    "100"   : UIFont.Weight.ultraLight,
    "200"   : UIFont.Weight.thin      ,
    "300"   : UIFont.Weight.light     ,
    "400"   : UIFont.Weight.regular   ,
    "500"   : UIFont.Weight.medium    ,
    "600"   : UIFont.Weight.semibold  ,
    "700"   : UIFont.Weight.bold      ,
    "800"   : UIFont.Weight.heavy     ,
    "900"   : UIFont.Weight.black     ,
  ];
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return false;
  };
  
  @objc func getHeightAndWidth(
    //js func params
    _          strings : NSArray  ,
    fontName   fname   : String   ,
    fontSize   fsize   : NSInteger,
    fontWeight fweight : String   ,
    //promise blocks
    resolver resolve : @escaping RCTPromiseResolveBlock, //call when success
    rejecter reject  : @escaping RCTPromiseRejectBlock   //call when error/fail
  ) -> Void {
    
    guard
      //cast nsarray to swift string array
      let strings = strings as? [String],
      let weight  = MeasureText.weightMap[fweight],
      let font = ((fname == "default" || fname.isEmpty)
        ? UIFont.systemFont(ofSize: CGFloat(fsize))
        : UIFont(name: fname, size: CGFloat(fsize))
      )?.withWeight(weight)
      
    else {
      let message = "MeasureText - getHeightAndWidth - unable to get width and height";
      print("debug - \(message)");
      reject("E_INIT_ERROR", message, nil);
      return;
    };
    
    let values = Dictionary<String, [String:Int]>(uniqueKeysWithValues: strings.map {
      let dimensions = $0.SizeOf(font);
      return ($0, [
        "width" : Int(dimensions.width ),
        "height": Int(dimensions.height),
      ]);
    })
    
    resolve(values);
  };
};

