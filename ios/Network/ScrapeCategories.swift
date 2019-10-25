import Foundation

typealias getCategoriesHandler = (Result<[MediaFandomItem]?, ScrapeError>) -> Void;

enum ScrapeError: Error {
  case badURL;
  case fetchError;
  case parseError;
};

//todo: add error msgs
extension ScrapeError: LocalizedError {
  public var errorDescription: String? {
    switch self {
    case .badURL    : return "";
    case .fetchError: return "";
    case .parseError: return "";
    };
  };
};

// Construct a URL by assigning its parts to a URLComponents value
class ScrapeCategories {
  static let url: URL? = {
    var urlComp = URLComponents();
    //make/build url
    urlComp.scheme = "https";
    urlComp.host   = "archiveofourown.org";
    urlComp.path   = "/media";
    //extract and unwrap url
    return urlComp.url;
  }();
  
  static func getCategories(completionHandler: @escaping getCategoriesHandler) {
    guard let url = ScrapeCategories.url else {
      //bad/malformed url
      completionHandler(.failure(.badURL));
      return;
    };
 
    let session = URLSession.shared;
    let task = session.dataTask(with: url) { result in
      switch result {
      case .success(_, let data):
        guard let htmlString = String(data: data, encoding: .utf8) else {
          completionHandler(.failure(.parseError));
          print("debug - getCategories Error: data was nil, couldn't cast data into String");
          return;
        };
        
        guard let categories = AO3HTMLParser.extractMediaFandomList(html: htmlString) else {
          completionHandler(.failure(.parseError));
          print("debug - getCategories Error: extractMediaFandomList failed");
          return;
        };
        
        for (index, category) in categories.enumerated() {
          print("\(index) category of \(categories.count)");
          category.printValues();
        };
        completionHandler(.success(categories));
        break;
          
      case .failure(let error):
        completionHandler(.failure(.fetchError));
        print("debug - getCategories Error: \(error.localizedDescription)");
        break;
      };
    };
    //start task
    task.resume();
  };
};
