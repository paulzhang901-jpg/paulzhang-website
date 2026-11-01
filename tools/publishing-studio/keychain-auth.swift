import Cocoa
import Security
import Foundation

let service = "org.paulzhang.publishing-studio.github"
let account = "paulzhang901-jpg/paulzhang-website"
let query: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service, kSecAttrAccount as String: account]
func emit(_ value: [String: Any]) { if let data = try? JSONSerialization.data(withJSONObject: value, options: [.sortedKeys]), let text = String(data: data, encoding: .utf8) { print(text) } }
let mode = CommandLine.arguments.dropFirst().first ?? "authorize"
if mode == "read" {
    var lookup = query; lookup[kSecReturnData as String] = true; lookup[kSecMatchLimit as String] = kSecMatchLimitOne
    var result: CFTypeRef?
    let status = SecItemCopyMatching(lookup as CFDictionary, &result)
    guard status == errSecSuccess, let data = result as? Data else { exit(status == errSecItemNotFound ? 4 : 5) }
    FileHandle.standardOutput.write(data) // private pipe to Worker only; never a UI/log command
    exit(0)
}
if mode == "status" {
    var lookup = query; lookup[kSecReturnAttributes as String] = true
    var result: CFTypeRef?; let status = SecItemCopyMatching(lookup as CFDictionary, &result)
    emit(["stored": status == errSecSuccess, "storage": "macOS Keychain"]); exit(0)
}
guard mode == "authorize" else { exit(2) }
let app = NSApplication.shared
app.setActivationPolicy(.regular)
let menu = NSMenu(); let editItem = NSMenuItem(title: "Edit", action: nil, keyEquivalent: ""); let edit = NSMenu(title: "Edit")
edit.addItem(withTitle: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
edit.addItem(withTitle: "Select All", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
editItem.submenu = edit; menu.addItem(editItem); app.mainMenu = menu
app.activate(ignoringOtherApps: true)
let alert = NSAlert()
alert.messageText = "Publishing Studio · GitHub 安全授权"
alert.informativeText = "请在下方输入你生成的 GitHub Token。输入隐藏，仅存入本机 macOS 钥匙串。程序只测试连接，不创建 PR、不发布。"
let field = NSSecureTextField(frame: NSRect(x: 0, y: 0, width: 440, height: 28))
field.placeholderString = "GitHub Token（隐藏输入）"; alert.accessoryView = field
alert.addButton(withTitle: "安全保存并验证"); alert.addButton(withTitle: "取消")
alert.window.initialFirstResponder = field
let choice = alert.runModal()
guard choice == .alertFirstButtonReturn else { emit(["authenticated": false, "cancelled": true]); exit(0) }
let token = field.stringValue.trimmingCharacters(in: .whitespacesAndNewlines); field.stringValue = ""
guard token.count >= 20, token.count <= 1024, token.rangeOfCharacter(from: .whitespacesAndNewlines) == nil else { emit(["authenticated": false, "reason": "Invalid token format; nothing saved"]); exit(1) }
func verify(_ suffix: String) -> Bool {
    guard let url = URL(string: "https://api.github.com/repos/" + account + suffix) else { return false }
    var request = URLRequest(url: url); request.timeoutInterval = 25
    request.setValue("Bearer " + token, forHTTPHeaderField: "Authorization")
    request.setValue("application/vnd.github+json", forHTTPHeaderField: "Accept")
    request.setValue("2022-11-28", forHTTPHeaderField: "X-GitHub-Api-Version")
    let semaphore = DispatchSemaphore(value: 0)
    final class Outcome: @unchecked Sendable { var ok = false }; let outcome = Outcome()
    let session = URLSession(configuration: .ephemeral)
    session.dataTask(with: request) { _, response, _ in
        outcome.ok = (response as? HTTPURLResponse)?.statusCode == 200; semaphore.signal()
    }.resume()
    let completed = semaphore.wait(timeout: .now() + 30) == .success; session.invalidateAndCancel(); return completed && outcome.ok
}
let verified = verify("") && verify("/pulls?state=open&per_page=1") && verify("/actions/workflows/architecture-validation.yml/runs?per_page=1")
guard verified else {
    emit(["authenticated": false, "reason": "Read-only GitHub check failed; nothing saved"])
    let error = NSAlert(); error.messageText = "连接未通过，未保存 Token"; error.informativeText = "请核对网络、Token 有效期及目标仓库权限。不会自动重试，也不会发布。"; error.runModal(); exit(1)
}
var item = query
item[kSecValueData as String] = Data(token.utf8)
item[kSecAttrLabel as String] = "Paul Zhang Publishing Studio GitHub"
item[kSecAttrAccessible as String] = kSecAttrAccessibleWhenUnlockedThisDeviceOnly
let status = SecItemAdd(item as CFDictionary, nil)
guard status == errSecSuccess else {
    emit(["authenticated": false, "reason": status == errSecDuplicateItem ? "Credential already exists; not overwritten" : "Keychain save denied"]); exit(1)
}
emit(["authenticated": true, "readEndpointsVerified": true, "writePermissionVerified": false, "repository": account, "storage": "macOS Keychain", "at": ISO8601DateFormatter().string(from: Date())])
exit(0)
