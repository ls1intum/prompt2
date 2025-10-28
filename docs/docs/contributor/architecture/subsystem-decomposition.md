---
sidebar_position: 1
---

# 📦 Subsystem Decomposition

This document describes the subsystem architecture of the **PROMPT Core Platform**. It outlines the core components, their technologies, responsibilities, and how they interact with each other and with external services.

## 🧩 Overview

The PROMPT platform is composed of two main subsystems:

* **Prompt Core Server** (Golang + PostgreSQL)
* **Prompt Core Client** (React)

These components form the foundation of the course management platform. Both client and server are integrated with **Keycloak** for identity and access management.

```{figure} ./subsystem.png
Subsystem Decomposition for the PROMPT Core. The grey color represents off-the-shelf external components. The green color represents a course phase type implemented as an independent service, which is a placeholder for a concrete course phase type, such as intro course or team allocation. Blue highlights the core components.
```

## ⚙️ Core Subsystems

### 🖥️ Prompt Core Server

The server is built in **Go (Golang)** and uses **PostgreSQL** as its persistence layer. Key server-side components include:

* **Course**
  Handles course creation and configuration, student registration, and orchestration of the course phases.

* **Course Phase**
  Manages individual course phases (e.g., intro course, team allocation). This component:

  * Manages participants and assessments (pass/fail).
  * Provides basic storage capabilities for course-phase-specific or participant-specific data.
  * Delegates phase-specific business logic to external services.

* **Course Phase Type Registration**
  Registers available course phase types and makes them accessible to the `Course Phase` and client-side components.

* **Application**
  Manages the student application workflow including:

  * Application form logic and assessment
  * Integration with the `Course Signup Service` for student registration
  * Notification via the `Mailing` component

### 🧑‍🎓 Course Phase Services

Each **course phase type** (e.g., intro course or team allocation) is implemented as an **independent service**. These services provide the logic, UI, and additional storage required for their specific course phase.

* Each service may include its own **server** and **database**.
* They interact with the core via registered interfaces and use the core-provided storage if needed.

### 🌐 Prompt Core Client

The client is built in **React** and communicates with the core server and course phase services. Main components include:

* **Course Configurator**
  Allows instructors to create and configure courses. Instructors can:

  * Select and order course phases
  * Define student and data flow between phases

* **Dynamic Phase Loading**
  Loads React-based microfrontends from registered course phase services at runtime using the **Remote Entry Service**. This:

  * Dynamically integrates phase-specific UIs into the core UI
  * Ensures that students and instructors see relevant course phase interfaces

* **Student Application**
  Provides the frontend for students to apply for a course. Communicates with the `Application` component on the server.

## 🛠️ Technology Stack

| Component             | Technology                            |
| --------------------- | ------------------------------------- |
| Core Server           | Golang                                |
| Database              | PostgreSQL                            |
| Core Client           | React                                 |
| Identity Management   | Keycloak                              |
| Course Phase Services | Microservice stack (custom per phase) |

## 🧭 Responsibilities Breakdown

| Component                | Responsibilities                                            |
| ------------------------ | ----------------------------------------------------------- |
| `Course`                 | Course lifecycle, student registration, phase orchestration |
| `Course Phase`           | Participant management, phase assessment, storage interface |
| `Course Phase Type Reg.` | Registering available phase types                           |
| `Application`            | Application form handling, assessment                       |
| `Course Configurator`    | UI for course setup by instructors                          |
| `Dynamic Phase Loading`  | Runtime microfrontend loading from phase services           |
| `Remote Entry Service`   | Fetch and serve microfrontend for course phase              |
| `Course Phase Service`   | Custom logic + optional server/database for each phase      |

