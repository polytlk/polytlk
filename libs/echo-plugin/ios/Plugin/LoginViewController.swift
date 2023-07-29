//
//  LoginViewController.swift
//  Plugin
//
//  Created by Haiturtle on 7/29/23.
//  Copyright © 2023 Max Lynch. All rights reserved.
//

import UIKit
import GoogleSignIn
import Capacitor

struct ResponseData: Codable {
    let token: String
}

class LoginViewController: UIViewController {
    let googleSignInButton = GIDSignInButton()
    var signOutButton: UIButton!
    var greetingLabel: UILabel!
    var plugin: CAPPlugin!

    func tokenSignIn(idToken: String) {
      guard let authData = try? JSONEncoder().encode(["access_token": idToken]) else {
          return
      }
      let url = URL(string: "http://localhost:8080/api/auth/exchange/")!
      var request = URLRequest(url: url)
      request.httpMethod = "POST"
      request.setValue("application/json", forHTTPHeaderField: "Content-Type")

      let task = URLSession.shared.uploadTask(with: request, from: authData) { data, response, error in
        if let error = error {
            print("Error: \(error)")
        } else if let data = data {
            do {
                let decoder = JSONDecoder()
                let responseData = try decoder.decode(ResponseData.self, from: data)
                
                // Return to the previous view
                DispatchQueue.main.async {
                    self.dismiss(animated: true, completion: nil)
                    // Notify listeners with the token
                    self.plugin.notifyListeners("loginResult", data: ["token": responseData.token])
                }
            } catch {
                print("Error: Unable to decode the JSON response")
            }
        }
      }
      task.resume()
  }


    @IBAction func signIn(sender: Any) {
      GIDSignIn.sharedInstance.signIn(withPresenting: self) { signInResult, error in
        guard error == nil else { return }
        guard let user = signInResult?.user else { return }
          
        // Print user information
        print("User ID: \(user.userID!)") // The user's ID
        print("Full name: \(user.profile!.name)") // The user's full name
        print("Given name: \(user.profile!.givenName!)") // The user's given name
        print("Family name: \(user.profile!.familyName!)") // The user's family name
        print("Email: \(user.profile!.email)") // The user's email address

        
        if let idToken = user.idToken?.tokenString {
            self.tokenSignIn(idToken: idToken)
        } else {
            print("idToken is nil")
        }
      }
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        // Add greeting label
        greetingLabel = UILabel()
        greetingLabel.text = "Please sign in... 🙂"
        greetingLabel.textAlignment = .center
        greetingLabel.backgroundColor = .tertiarySystemFill
        view.addSubview(greetingLabel)
        greetingLabel.translatesAutoresizingMaskIntoConstraints = false
        greetingLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor).isActive = true
        greetingLabel.centerYAnchor.constraint(equalTo: view.centerYAnchor, constant: -80).isActive = true
        greetingLabel.heightAnchor.constraint(equalToConstant: 54).isActive = true
        greetingLabel.widthAnchor.constraint(equalToConstant: 300).isActive = true
        
    
        googleSignInButton.center = view.center
        googleSignInButton.addTarget(self, action: #selector(signIn(sender:)), for: .touchUpInside)
        view.addSubview(googleSignInButton)
        
        // Add sign-out button
        signOutButton = UIButton()
        signOutButton.layer.cornerRadius = 10.0
        signOutButton.setTitle("Sign Out 👋", for: .normal)
        signOutButton.setTitleColor(.label, for: .normal)
        signOutButton.backgroundColor = .systemFill
        view.addSubview(signOutButton)
        signOutButton.translatesAutoresizingMaskIntoConstraints = false
        signOutButton.centerXAnchor.constraint(equalTo: view.centerXAnchor).isActive = true
        signOutButton.centerYAnchor.constraint(equalTo: view.centerYAnchor, constant: 80).isActive = true
        signOutButton.heightAnchor.constraint(equalToConstant: 44).isActive = true
        signOutButton.widthAnchor.constraint(equalToConstant: 150).isActive = true
        
        // Sign-out button is hidden by default
        signOutButton.isHidden = true
    }

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destination.
        // Pass the selected object to the new view controller.
    }
    */

}
