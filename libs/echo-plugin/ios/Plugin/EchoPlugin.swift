import Foundation
import Capacitor

@objc public class EchoPlugin: NSObject {
    @objc public func renderLogin(from plugin: CAPPlugin, baseUrl: String) {
        DispatchQueue.main.async {
            let loginViewController = LoginViewController()

            loginViewController.plugin = plugin
            loginViewController.baseUrl = baseUrl
            
            guard let viewController = plugin.bridge?.viewController else {
                print("ViewController is nil")
                return
            }
            
            viewController.present(loginViewController, animated: true, completion: nil)
        }
    }
}
