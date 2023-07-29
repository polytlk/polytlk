import Foundation
import Capacitor

@objc public class EchoPlugin: NSObject {
    @objc public func renderLogin(from plugin: CAPPlugin) {
        DispatchQueue.main.async { [weak self] in
            let loginViewController = LoginViewController()

            // Set the plugin
            loginViewController.plugin = plugin
            
            guard let viewController = plugin.bridge?.viewController else {
                print("ViewController is nil")
                return
            }
            
            viewController.present(loginViewController, animated: true, completion: nil)
        }
    }
}
