import Foundation
import Capacitor
import UniformTypeIdentifiers

extension UIColor {
    convenience init(hex: String, alpha: CGFloat = 1.0) {
        let hexValue = hex.trimmingCharacters(in: .whitespacesAndNewlines).uppercased().dropFirst(hex.hasPrefix("#") ? 1 : 0)

        let intRepresentation = UInt32(hexValue, radix: 16) ?? 0

        let red = CGFloat((intRepresentation & 0xFF0000) >> 16) / 255.0
        let green = CGFloat((intRepresentation & 0x00FF00) >> 8) / 255.0
        let blue = CGFloat(intRepresentation & 0x0000FF) / 255.0
        self.init(red: red, green: green, blue: blue, alpha: alpha)
    }
}

public class CustomUIDocumentBrowserViewController: UIDocumentBrowserViewController {
    public var beforeDismiss: (() -> Void)?
    
    private lazy var dismissButton: UIBarButtonItem = {
       return UIBarButtonItem(barButtonSystemItem: .close, target: self, action: #selector(dismissSelf))
    }()

    public override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    public func setDismissButton(isHidden: Bool) {
        self.additionalTrailingNavigationBarButtonItems = isHidden ? [] : [dismissButton]
    }
    
    @objc func dismissSelf() {
        self.beforeDismiss?()
        self.dismiss(animated: true)
    }
}

let defaultEncoding = String.Encoding.utf8

//TODO: Check CAPBridgedPlugin
@objc(CapacitorNativeFilesPlugin)
public class CapacitorNativeFilesPlugin: CAPPlugin, CAPBridgedPlugin, UIDocumentBrowserViewControllerDelegate {
    public let identifier = "CapacitorNativeFilesPlugin"
    public let jsName = "CapacitorNativeFiles"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "selectFile", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "writeToFile", returnType: CAPPluginReturnPromise),
    ]

    private var call: CAPPluginCall?
    private var documentBrowserVC: CustomUIDocumentBrowserViewController?

    @objc func selectFile(_ call: CAPPluginCall) {
        self.call = call
        DispatchQueue.main.async {
            self.documentBrowserVC = CustomUIDocumentBrowserViewController(forOpening: [UTType.item])
            self.documentBrowserVC?.delegate = self
            self.documentBrowserVC?.beforeDismiss = {
                self.notifyListeners("fileBrowserAboutToDismiss", data: [:])
            }
            self.documentBrowserVC?.setDismissButton(isHidden: call.getBool("hideDismissButton", false))
            self.documentBrowserVC?.allowsDocumentCreation = true
            self.documentBrowserVC?.shouldShowFileExtensions = true
            self.documentBrowserVC?.modalPresentationStyle = .fullScreen
            if let modalTransitionStyleKey = call.getString("modalTransitionStyle"),
               let modalTransitionStyle = [
                   "crossDissolve": UIModalTransitionStyle.crossDissolve,
                   "coverVertical": UIModalTransitionStyle.coverVertical,
                   "flipHorizontal": UIModalTransitionStyle.flipHorizontal,
                   "partialCurl": UIModalTransitionStyle.partialCurl
               ][modalTransitionStyleKey] {
                self.documentBrowserVC?.modalTransitionStyle = modalTransitionStyle
            }
            
            if let tintColor = call.getString("tintColor") {
                self.documentBrowserVC?.view.tintColor = UIColor(hex: tintColor)
            }
            self.bridge?.viewController?.present(self.documentBrowserVC!, animated: true) {
                self.notifyListeners("fileBrowserPresented", data: [:])
            }
        }
    }
    
    @objc func closeSelectFile(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let documentBrowserVC = self.documentBrowserVC {
                documentBrowserVC.dismiss(animated: true) {
                    call.resolve()
                }
            } else {
                call.reject("No file browser is currently open.")
            }
        }
    }
    
    private func openFile(url url: URL, controller controller: UIDocumentBrowserViewController) {
        guard url.startAccessingSecurityScopedResource() else {
            self.call?.reject("Failed to access the file.")
            return
        }
        
        do {
            //TODO: Consider removing prints.
            print("////")
            var usedEncoding = defaultEncoding
            print(defaultEncoding)
            print(usedEncoding)
            let fileContent = try String(contentsOf: url, usedEncoding: &usedEncoding)
            print(defaultEncoding)
            print(usedEncoding)
            print("////")
            self.call?.resolve([
                "fileContent": fileContent,
                "filePath": url.path,
                "fileExtension": url.pathExtension,
                "fileName": url.deletingPathExtension().lastPathComponent
            ])
            controller.dismiss(animated: true, completion: nil)
        } catch {
            self.call?.reject("Failed to read file content.", error.localizedDescription)
        }
    }

    public func documentBrowser(_ controller: UIDocumentBrowserViewController, didPickDocumentsAt urls: [URL]) {
        guard let url = urls.first else {
            self.call?.reject("No files were picked.")
            return
        }
        
        openFile(url: url, controller: controller)
    }

    public func documentBrowser(_ controller: UIDocumentBrowserViewController, didRequestDocumentCreationWithHandler importHandler: @escaping (URL?, UIDocumentBrowserViewController.ImportMode) -> Void) {
        let newFileURL = FileManager.default.temporaryDirectory.appendingPathComponent("untitled.md")
        
        do {
            let data = Data()
            try data.write(to: newFileURL, options: [.atomic])
            importHandler(newFileURL, .move)
        } catch {
            print("File creation failed: \(error)")
            importHandler(nil, .none)
        }
    }
    
    public func documentBrowser(_ controller: UIDocumentBrowserViewController, didImportDocumentAt sourceURL: URL, toDestinationURL destinationURL: URL) {
        //TODO: Consider finding a way to not have to pass controller to openFile. Similar outlook for any Similar functions as well.
        openFile(url: destinationURL, controller: controller)
    }
    
    @objc func writeToFile(_ call: CAPPluginCall) {
        guard let filePath = call.getString("filePath"),
              let content = call.getString("fileContent") else {
            call.reject("fileContent & filePath must be provided.")
            return
        }

        DispatchQueue.global(qos: .userInitiated).async {
            let url = URL(fileURLWithPath: filePath)

            let isAccessing = url.startAccessingSecurityScopedResource()
            defer {
                if isAccessing {
                    url.stopAccessingSecurityScopedResource()
                }
            }

            do {
                //TODO: Remove prints.
                print("^^^^")
                print(defaultEncoding)
                var encoding = defaultEncoding
                print(encoding)
                try String(contentsOf: url, usedEncoding: &encoding)
                print(defaultEncoding)
                try content.write(to: url, atomically: true, encoding: encoding)
                print(encoding)
                print("^^^^")
                DispatchQueue.main.async {
                    call.resolve()
                }
            } catch {
                DispatchQueue.main.async {
                    call.reject("Failed to write to file: \(error.localizedDescription)")
                }
            }
        }
    }
}

