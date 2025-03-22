package data

import "fmt"

func GetReadme(deadline string) string {
	return fmt.Sprintf(`# Intro Course Project App of <yourname> for the iPraktikum
To pass the intro course, you need to create your own unique iOS app (based on SwiftUI).

There are no requirements regarding the functions of your app, so you can get creative.
However, we provide you with Non-Functional Requirements (NFR) that your app needs to fulfill.

After each day of learning new Swift and SwiftUI concepts, these NFRs may change, or new NFRs get added.

## Submission procedure

You get a **personal repository** on Gitlab to work on your app.

Once you implemented a new feature into your app, you need to create a Merge Request (MR - Sometimes we will also reference these as "Pull Requests"(PR)) to merge your changes from the feature branch into your main branch.

Your tutor will review your changes and either request changes or approves the MR.

If your MR got approved, you also need to merge it!

### Deadline: **%s**

Until the deadline all of your PRs **need to be merged** and your final app **needs to fulfill** all of the requested NFRs!

---

## Problem Statement (max. 500 words)

TODO: Add your problem statement here. 

## Requirements

TODO: Document the requirements you fulfilled with your app. Discuss them with your tutor.

## Analysis

TODO: Include an analysis object model. You can use [draw.io](https://draw.io) or [apollon](https://apollon.ase.cit.tum.de) to create it. Please add all models as an Image - not as a link!

## System Design

TODO: Include a system design overview describing your application.

## Product Backlog

TODO: Add a product backlog and don't forget to update it with each MR.
`, deadline)
}
