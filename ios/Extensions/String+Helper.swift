import Foundation;
import UIKit;

extension String {
    func SizeOf(_ font: UIFont) -> CGSize {
      return self.size(withAttributes: [NSAttributedString.Key.font: font]);
  };
};
