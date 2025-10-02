package data

func GetGitignore() string {
	return `# TUM LS1 2025 .gitignore file

# Build generated
build/
DerivedData/

# System files
.DS_Store

# Xcode
*.moved-aside
xcuserdata/
*.xccheckout
*.xcscmblueprint

# Other
*.pbxuser
!default.pbxuser
*.mode1v3
!default.mode1v3
*.mode2v3
!default.mode2v3
*.perspectivev3
!default.perspectivev3

# Obj-C/Swift specific
*.hmap
*.ipa
*.dSYM.zip
*.dSYM

# Playgrounds
timeline.xctimeline
playground.xcworkspace

# Swift Package Manager
#
# Add this line if you want to avoid checking in source code from Swift Package Manager dependencies.
.swiftpm
.build/
Package.resolved

# CocoaPods
#
# We recommend adding the Pods directory to your .gitignore. However
# you should judge for yourself, the pros and cons are mentioned at:
# https://guides.cocoapods.org/using/using-cocoapods.html#should-i-check-the-pods-directory-into-source-control
Pods/

# Carthage
#
# Add this line if you want to avoid checking in source code from Carthage dependencies.
Carthage/Checkouts
Carthage/Build

## User settings (standard .gitignore for xcode projects)
xcuserdata/

# Add this line if you want to avoid checking in source code from Swift Package Manager dependencies.
Packages/**
Package.pins
Package.resolved

# Ignore projectfiles (only if xcodegen is used)
*.xcodeproj
*.xcworkspace
*.xcscheme
*.pbxproj

.swift-openapi-generator`

}
