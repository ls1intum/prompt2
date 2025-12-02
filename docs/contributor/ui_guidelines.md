---
sidebar_position: 5
---

# UI Integration for Course Phase Services

## Overview

PROMPT 2 uses **module federation** to dynamically integrate course phase services into the core client. Each service exposes its own microfrontend, enabling a modular architecture that promotes development flexibility.

However, this architecture also introduces the challenge of maintaining a **consistent user experience** across independently developed components. These guidelines define how to integrate your course phase service with the core UI while ensuring usability and consistency.

## Sidebar Integration

The PROMPT 2 core application displays course phases via a **unified sidebar**, based on the structure defined in the course configurator.

- Lecturers see **all configured phases** in the order defined.
- Students see **only the phases they have reached**, supporting guided progression.

Each course phase service **must define**:

- One **main page** (shown when the phase is selected).
- Optionally, **subpages**, which appear as nested items in the sidebar.


## Best Practices for Course Phase UI Design

To ensure consistency and usability across all phases, follow these design conventions:

### 1. Student-Facing Main Page

* Place **key student actions** (e.g., submitting a form) directly on the **main page**.
* Avoid requiring navigation into subpages to complete primary tasks.

### 2. Lecturer-Facing Main Page

* Clearly state the **purpose of the course phase**.
* Provide a **summary of the current status**, using:

  * Progress indicators
  * Configuration warnings
  * Visual summaries
* The goal is to quickly inform the lecturer and guide their next actions.

### 3. Recommended Subpages (for Lecturers)

Use the following subpages to maintain a consistent navigation pattern:

* **Participants**: List all students in the phase and their assessment status.
* **Student Preview**: Show the main student-facing page as seen by a student.
* **Mailing** *(Optional)*: Configure and send emails to students in this phase.
* **Configuration**: All phase-specific settings and configurations.
  *(Mailing configurations should remain in the "Mailing" page if used.)*

## Flexibility and Exceptions

While deviations from these guidelines are allowed when required by specific functionality, strive to:

* Minimize UI inconsistency.
* Keep navigation and layout familiar across phases.
* Promote clarity and efficiency for both students and lecturers.

By adhering to these conventions, your course phase service can remain modular while contributing to a **cohesive and intuitive user experience** throughout the PROMPT system.
