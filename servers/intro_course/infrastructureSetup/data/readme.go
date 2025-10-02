package data

import (
	"fmt"
	"strings"
)

const (
	readmeBacktickPlaceholder = "<<BT>>"
	readmeTemplateRaw         = `# %s's Intro Course App

Welcome to your project repository! To pass the intro course, you will build a unique iOS app using SwiftUI. There are no limitations on the app’s functionality—be as creative as you like. Your app must, however, satisfy the **quality attributes & external constraints** specified in the course materials.

## Local development
For your Intro Course App, you will use XcodeGen to manage your Xcode Project. 

**What is XcodeGen?** XcodeGen is a tool that automatically generates Xcode project files from a simple configuration file. Instead of manually managing complex Xcode project settings, you define your project structure in the provided <BT>project.yml<BT> file, and XcodeGen creates the <BT>.xcodeproj<BT> file for you. This makes it easier to manage your Xcode project under version control (git), and resolve any merge conflicts that arise.

**Why do we need this?** When you clone this repository, you won't find a ready-to-use <BT>.xcodeproj<BT> file, which you can directly open with Xcode. Instead, you'll find a <BT>project.yml<BT> configuration file that describes how the Xcode project should be set up. You need to generate the actual Xcode project file before you can open and work on the app in Xcode.

1. Install xcodegen
    <BT><BT><BT>bash
    brew install xcodegen
    <BT><BT><BT>
2. Generate .xcodeproj
    <BT><BT><BT>bash
    xcodegen generate
    <BT><BT><BT>
    
    After running this command, you'll see a new <BT>.xcodeproj<BT> file appear in your project folder. You can then double-click this file to open your project in Xcode.

Since the <BT>xcodegen generate<BT> command must be run when the project is cloned and whenever changes affect the project structure, you can enable Git hooks to run the command automatically after merges and pulls.

Run the following command to point <BT>git<BT> to the hooks:
<BT><BT><BT>bash
git config core.hooksPath .githooks
<BT><BT><BT>

## Submission Procedure

1. **Personal Repository**
   You have been given a personal repository on GitLab to work on your app.

2. **Issue-Based Development**

    * Follow the issue-based development process from the Git Basics and Software Engineering sessions.
    * For every task, open or update the matching GitLab **issue** (or checklist item) before writing code.
    * Inside the issue or task, press **Create branch**. Confirm that **Source branch = <BT>main<BT>** and let GitLab generate the feature-branch name so the branch stays linked to the issue.
    * After GitLab creates the branch, sync your local repo and check out that branch (GitLab already created it on the server, so you only need to fetch it locally):

     <BT><BT><BT>bash
     git checkout main
     git pull origin main
     git fetch origin
     git checkout <branch-name>
     <BT><BT><BT>

3. **Merge Requests (MRs)**

   * For each completed issue / task, open an **MR targeting <BT>main<BT>** (source: your feature branch → target: <BT>main<BT>).
   * Add your tutor as a reviewer and collaborate on requested changes.
   * Keep MRs focused and small where possible; ensure CI/build checks are green.
   * **Do not commit directly to <BT>main<BT>.** Use MRs only.
   * It is **your responsibility to press "Merge"** once the MR is approved.

**Deadline:** **%s**

**All MRs must be merged into <BT>main<BT> by the deadline.** The version on <BT>main<BT> at the deadline is considered your final submission. Your app must satisfy all required **quality attributes & external constraints**. During the first four days there are intermediate deadlines for software engineering artifacts to help you stay on track.

---

## Project Documentation

This README serves as your primary documentation. Update it as your project evolves.

### Problem Statement (max. 500 words)

*TODO: Add your problem statement here.*

### Requirements

#### Functional Requirements (User Stories)

*TODO: List the user stories that your app fulfills. These should be added to the GitLab product backlog as issues. Discuss and refine them with your tutor.*

- As a [user], I want to [action] so that [goal].

For Example (an Expense Tracking App): As a [student], I want to [see all my monthly transactions] so that [I can make better financial decisions].

#### Quality Attributes & External Constraints

*TODO: For each required quality attribute or constraint (e.g., HIG usability, dark mode, responsiveness, persistence, logging, error handling, responsible AI usage), add a short subsection that summarizes your solution, links to supporting evidence (file, screenshot, test, or slide), and notes any follow-up work. When documenting responsible AI usage, summarize prompts you ran, how you reviewed/adapted the output, and the guardrails (manual testing, peer review, etc.) you applied.*

* **Responsible AI usage:** *TODO — add this once you document your AI-supported work (prompt highlights, review steps, guardrails, evidence links).*
* **Other attributes / constraints:** *TODO — add concise subheadings with one-paragraph summaries and supporting links or screenshots.*

#### Glossary (Abbott’s Technique)

*TODO: Define key terms and concepts used in your project. Clarify domain-specific language or abbreviations.*

| Terms    | Definition      |
| ------------- | ------------- |
| example: Transaction | A transaction is when money moves out of one account in exchange for a product or service. |
| ... | ... |

#### Analysis Object Model

*TODO: Add an analysis object model diagram showing relationships between key entities in your app.*

* **Instructions:** Create with [apollon](https://apollon.ase.cit.tum.de), [draw.io](https://draw.io) or alternatives, export as an **image** and insert it directly (no links, **no SVG**).

Inserting an image in Markdown:
<BT><BT><BT> 
![Alt text](image path)
<BT><BT><BT> 

### Architecture

#### Subsystem Decomposition

*TODO: Break down your app into its main subsystems (e.g., UI layer, networking, data/persistence, domain/logic, feature modules). Describe responsibilities, main data flows, and key dependencies. A simple diagram is encouraged.*

* Subsystem A — responsibilities, key types, inbound/outbound data
* Subsystem B — ...
* ...

---

*Replace placeholders and keep this document current. It’s both your planning guide and part of your final deliverable.*

Happy coding!
`
)

var readmeTemplate = strings.ReplaceAll(readmeTemplateRaw, readmeBacktickPlaceholder, "`")

func GetReadme(name, deadline string) string {
	return fmt.Sprintf(readmeTemplate, name, deadline)
}
