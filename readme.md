# PROMPT 2.0: A Modular and Scalable Management Platform for Project-Based Teaching

## Main Goals
PROMPT 2.0 is a course management platform designed to support project-based teaching by streamlining organizational complexities. Initially developed for the iPraktikum at the Technical University of Munich (TUM), PROMPT has been reimagined to be flexible, modular, and applicable to a wide range of project-based courses. The platform helps instructors efficiently manage tasks such as student applications, team allocation, grading, and infrastructure setup.

---

## Project Structure
PROMPT 2.0 is designed around the principle that a course consists of a sequence of independent, reusable course phases. This modularity is a central feature, reflected in both the client and server architectures. Each side is composed of a core component, offering shared functionality, and independently loaded modules, where each module corresponds to a specific course phase.

### Clients
- Built using **React**, **Webpack module federation**, and **TypeScript**.
- Utilize a **shared library** for reusable UI components (built with `shadcn/ui`), shared functionality, and context management.
- Each course phase (e.g., Intro Course Phase, Team Phase) is implemented as an independent React module. These modules are dynamically loaded into the frontend, allowing flexible customization. The Application Phase is a unique exception, as it is shared across all courses and is bundled within the core frontend.

### Server
- Implements a **service-based architecture** with the core written in **Go**.
- The core provides essential functionality for managing courses.
- Each course phase type may have its own **dedicated service**, encapsulating the logic and operations specific to that phase type. These services may or may not be stateless. 


### Additional Components
- **Authentication:** Uses Keycloak for identity management.
- **Database:** Postgresql is used for the database service.

---

## Getting Started

### Prerequisites
To run the platform, ensure the following are installed:
- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) (for server and supporting services)

### Installation and Setup

#### Installing and Running the Clients
1. Navigate to the client directory:
    ```sh
    cd clients
    ```
2. Install dependencies:
    ```sh
    yarn install
    ```
3. Start the development clients:
    ```sh
    yarn run dev
    ```
    This command uses `lerna` to launch all micro frontends simultaneously. To start a specific micro frontend, navigate to its subdirectory and run the development command there.

#### Running the Server
1. Navigate to the server directory:
    ```sh
    cd server
    ```
2. Start the server in development mode:
    ```sh
    go run main.go
    ```

#### Running Supporting Services (Database and Keycloak)
1. Start the database and Keycloak using Docker:
    ```sh
    docker-compose up db keycloak
    ```
    To run the server in Docker alongside these services:
    ```sh
    docker-compose up
    ```