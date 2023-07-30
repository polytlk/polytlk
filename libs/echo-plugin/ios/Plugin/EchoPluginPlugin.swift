import Foundation
import Capacitor

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(EchoPluginPlugin)
public class EchoPluginPlugin: CAPPlugin {
    private let implementation = EchoPlugin()

    @objc func renderLogin(_ call: CAPPluginCall) {
        let baseUrl = call.getString("baseUrl") ?? ""

        implementation.renderLogin(from: self, baseUrl: baseUrl)
        call.resolve()
    }
}
