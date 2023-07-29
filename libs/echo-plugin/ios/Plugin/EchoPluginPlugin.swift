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
        implementation.renderLogin(from: self)
        call.resolve()
    }
}
