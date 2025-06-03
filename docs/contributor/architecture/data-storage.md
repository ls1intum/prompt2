# 🗃️ Data Storage and Inter-Phase Communication

The PROMPT 2 platform provides a structured and flexible system for storing course data and enabling communication between course phases. Each **course phase service** can either rely on the core platform for data storage or use its own persistence layer. Additionally, a declarative communication model allows services to request and share data across phases via well-defined contracts.

---

## 🧱 Data Storage Options

Course phase services can choose between:

### 1. 🔹 Core Storage

The **Course Phase** component in the core system provides two data fields for each course phase and course phase participation:

* `restricted_data`:

  * **Writable by**: Course Lecturers
  * **Readable by**: Lecturers and Editors

* `student_readable_data`:

  * **Writable by**: Course Lecturers
  * **Readable by**: Students, Lecturers, and Editors

This model is suitable for **lightweight, client-only services**, such as the Matching phase.

### 2. 🔸 Custom Storage

If a service requires:

* Students or Editors to write data
* Rich or phase-specific data schemas
* Performance-intensive access

…then it must implement its own persistent storage solution.

---

## 🔄 Inter-Phase Communication Schema

Some course phases require access to data from previous phases—for example, application forms, scores, or student profiles. This data may be needed at:

* The **course phase level** (data shared across all participants)
* The **participation level** (data per student per phase)

### 📋 DTO Definitions and Registration

To enable structured communication, PROMPT 2 uses **Data Transfer Objects (DTOs)**. Each course phase service must declare:

* What **output data** it provides
* What **input data** it requires
* Where each DTO is stored (core or custom service)

These declarations are submitted during **Course Phase Type Registration**.

#### 📦 Output DTO Schema

The table below outlines the structure used to register output DTOs:

| **Name**               | **Type** | **Description**                                                |
| ---------------------- | -------- | -------------------------------------------------------------- |
| `id`                   | UUID     | Unique identifier for the output DTO definition                |
| `course_phase_type_id` | UUID     | References the course phase type                               |
| `name`                 | String   | Logical name of the DTO (e.g., `Score`, `DeveloperProfile`)    |
| `version_number`       | Integer  | Version of the DTO definition                                  |
| `endpoint_url`         | String   | Fragment for the service endpoint (e.g., `/developerProfile/`) |
| `specification`        | JSON     | OpenAPI specification of the DTO structure                     |

> 📝 *Note*: Input DTOs follow the same schema but omit `version_number` and `endpoint_url`.

The core maintains these definitions per course phase and participation level.

---

## 🔀 Data Flow Configuration

Course lecturers use the **Course Configurator** to define **data flows** between phases. This is done by linking:

* **Output DTOs** from one phase
* To **Input DTOs** of another

The core system stores these links in two **data graphs**:

* One for course phase-level data
* One for participation-level data

When a service or client requests a DTO:

* If the data is stored in the **core**, the core returns it directly.
* If stored in a **course phase service**, the core returns the DTO’s endpoint and `coursePhaseID`.

---

## 🌐 Required Service Endpoints

For each output DTO stored **outside the core**, the course phase service must expose fixed **HTTP GET endpoints**, structured as follows:

### 📘 Participation-Level DTOs

* **List all DTOs for all participations**:

  ```text
  GET <coursePhaseServiceBaseURL>/course_phase/{coursePhaseID}/{endpoint_url}
  ```

  **Response:**

  ```json
  [
    {
      "courseParticipationID": "<courseParticipationID>",
      "dtoName": "<dto>"
    }
  ]
  ```

* **Get a specific DTO by participation**:

  ```text
  GET <coursePhaseServiceBaseURL>/course_phase/{coursePhaseID}/{endpoint_url}/{courseParticipationID}
  ```

  **Response:**

  ```json
  {
    "dtoName": "<dto>"
  }
  ```

### 📗 Course Phase-Level DTOs

* **Get the DTO for the course phase**:

  ```text
  GET <coursePhaseServiceBaseURL>/course_phase/{coursePhaseID}/{endpoint_url}
  ```

  **Response:**

  ```json
  {
    "dtoName": "<dto>"
  }
  ```

The actual resolution is implemented in the Go SDK and does not have to be implemented by each course phase service. 

---

## 🔐 Access Control for DTO Endpoints

* All endpoints **must be accessible to course lecturers**
* Course phase services may implement additional access controls (e.g., editor or student access)
* Services decide whether DTOs are visible to students or restricted

---

## ⚠️ Availability and Responsibility

The inter-phase communication schema defines a **contract**, but does not guarantee:

* That a service has stored the expected data
* That a service is available at the time of the request

Developers must ensure to handle missing or unreachable data gracefully.
