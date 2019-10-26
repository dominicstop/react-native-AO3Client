
import Foundation;
import UIKit;

extension UIFont {
  func withWeight(_ weight: UIFont.Weight) -> UIFont {
    var attributes = fontDescriptor.fontAttributes
    var traits = (attributes[.traits] as? [UIFontDescriptor.TraitKey: Any]) ?? [:]

    traits[.weight] = weight

    attributes[.name] = nil
    attributes[.traits] = traits
    attributes[.family] = familyName

    let descriptor = UIFontDescriptor(fontAttributes: attributes)

    return UIFont(descriptor: descriptor, size: pointSize)
  }
};
