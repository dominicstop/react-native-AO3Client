
#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

//export swift class AO3Scraper's methods to react native's native modules
@interface RCT_EXTERN_REMAP_MODULE(RNAO3Scraper, AO3Scraper, NSObject)

RCT_EXTERN_METHOD(getWorksFromURL:
              (NSString              )urlStr
    resolver: (RCTPromiseResolveBlock)resolve
    rejecter: (RCTPromiseRejectBlock )reject
);

@end