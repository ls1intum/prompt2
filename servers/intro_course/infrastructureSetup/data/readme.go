package data

import "fmt"

func GetReadme(name, deadline string) string {
	return fmt.Sprintf(`# Intro Course Project App of %s for the iPraktikum

Welcome to your project repository! To pass the intro course, you will need to develop a unique iOS app using SwiftUI. There are no limitations on the app’s functionality, so feel free to be as creative as you want. However, your app must meet the provided Non-Functional Requirements (NFRs), which are available on Artemis.

## Submission Procedure

1. **Personal Repository**:  
   You have been given a personal repository on GitLab to work on your app.

2. **Issue-Based Development**:  
   - Follow the issue-based development process from the Git Basics session.  
   - Create branches directly from issues (Dropdown -> Select "Create branch").

3. **Merge Requests (MR) (sometimes also Pull Requests (PR))**:  
   - Once you implement an issue, create a Merge Request to merge your changes from the feature branch into your main branch.
   - Add your tutor as a reviewer and communicate with them. Your tutor will review your changes and either request modifications or approve the MR.
   - It is **your responsibility to merge** the approved MR.

**Deadline**: **%s**

**All MRs must be merged by the deadline**, and your final app **must satisfy all** of the requested NFRs. Note that during the first four days, there are also intermediate merge deadlines for software engineering artifacts to help you stay on track with requirements and architecture.

---

## Project Documentation

This README serves as your primary documentation for the project. Update it as your project evolves.

### Problem Statement (max. 500 words)

TODO: Add your problem statement here.  

### Requirements

#### User Stories

TODO: List the user stories (functional requirements) that your app fulfills. These will be added to the GitLab product backlog as issues. Discuss and refine these with your tutor.

- As a [user], I want to [action] so that [goal].
- ...

#### Glossary (Abbott's Technique)

TODO: Define key terms and concepts used in your project. This section should clarify any domain-specific language or abbreviations.

#### Analysis Object Model

TODO: Include an analysis object model diagram that illustrates the relationships between key entities in your app.

- **Instructions**: Create your diagram using [draw.io](https://draw.io) or [apollon](https://apollon.ase.cit.tum.de), export it as an image, and insert it directly into this document (do not just provide a link and **don't use SVG**).

### Architecture

#### Top-Level Architecture

TODO: Describe the overall architecture of your app. 

#### Subsystem Decomposition

TODO: Break down your app into its main subsystems.

---

*Remember to replace placeholders and update each section with your project’s details. This document will serve both as your planning guide and as a final piece of documentation for your project.*

Happy coding!
`, name, deadline)
}
