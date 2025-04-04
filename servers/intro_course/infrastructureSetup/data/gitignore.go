package data

func GetGitignore() string {
	return `## User settings
xcuserdata/
## Obj-C/Swift specific
*.hmap
## App packaging
*.ipa
*.dSYM.zip
*.dSYM
## Playgrounds
timeline.xctimeline
playground.xcworkspace
.DS_Store
.build/`

}
