//
//  ViewController.swift
//  App
//
//  Created on 6/28/24 & re-created on 7/15/24.
//

import UIKit
import Capacitor

class ViewController: CAPBridgeViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        self.bridgedWebView?.inputAssistantItem.leadingBarButtonGroups.removeAll()
        self.bridgedWebView?.inputAssistantItem.trailingBarButtonGroups.removeAll()
        // Do any additional setup after loading the view.
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
