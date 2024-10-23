// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorNativeFiles",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "CapacitorNativeFiles",
            targets: ["CapacitorNativeFilesPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", branch: "main")
    ],
    targets: [
        .target(
            name: "CapacitorNativeFilesPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/CapacitorNativeFilesPlugin"),
        .testTarget(
            name: "CapacitorNativeFilesPluginTests",
            dependencies: ["CapacitorNativeFilesPlugin"],
            path: "ios/Tests/CapacitorNativeFilesPluginTests")
    ]
)