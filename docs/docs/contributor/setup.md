(contributor.setup-guide)=
---
sidebar_position: 3
---

# Setup Guide

Welcome to the **Prompt** setup guide! In this document, you will learn how to configure and run the development and (optionally) a demo production environment of the **Prompt** application.

## Overview

**Prompt** is composed of:

- A **Golang** backend (using [Gin](https://gin-gonic.com/), [SQLC](https://docs.sqlc.dev/), and [PostgreSQL](https://www.postgresql.org/)).
- A **TypeScript/React** client that runs in the browser and is structured as a core frontend dynamically loading multiple microfrontends. Each microfrontend typically represents one course phase.

## Prerequisites

```{admonition} Read the Contributor Guidelines
:class: warning
![notPass](https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHE5d3drMjQ2b2hidGdlYzM3azcyanhvZnZpNWF6bGl4cGdidGhvdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xULW8MYvpNOfMXfDH2/giphy.gif)


Before you continue, please make sure to read the [contributor guidelines](#contributor.guidelines).
```

Before you can build and run **Prompt**, you must install and configure the following dependencies on your machine:

1. **Golang**  
   - Install [Go](https://go.dev/doc/install).  
   - We recommend using the latest stable Go version (e.g., 1.20+) unless otherwise noted.

2. **PostgreSQL** (optional: recommended to use the Docker Setup)
   - Install [PostgreSQL](https://www.postgresql.org/download/).  
   - **Prompt** uses `sqlc` with `pgx/v5` and applies schema transformations automatically on startup. Make sure PostgreSQL is running and you have the necessary credentials to create and manage databases.

3. **Node.js**  
   - Install [Node.js LTS](https://nodejs.org/en) (version >= 22.10.0 < 23).  
   - Node.js is required to compile and run the React client application.

4. **Yarn**  
   - We use **Yarn** (version >= 4.0.1) to manage front-end dependencies.  
   - If you have not already, enable Corepack by running:

     ```bash
     corepack enable
     ```

   - This ensures you can run Yarn without a separate installation process.

## Development Environment

1. **Clone the Repository**  
   - Clone (or download) the Prompt repository to your local machine:

     ```bash
     git clone https://github.com/ls1intum/prompt2.git
     ```

2. **Start the Database and Keycloak Server**
   - Prompt requires both a database (PostgreSQL) and a Keycloak instance to run.
   - We recommend using the provided Docker setup:

     ```bash
     docker-compose up db keycloak
     ```

   - Make sure you have Docker installed and running. This command starts the PostgreSQL container and Keycloak on port `8081`.

3. **Configure Keycloak Server** (only on initial setup)
   - After Keycloak starts, navigate to [http://localhost:8081](http://localhost:8081) in your browser.
   - Log in to the **Keycloak Administrative Console** with:
     - **Username**: `admin`
     - **Password**: `admin`
   - In the top-left drop-down (which defaults to `master`), choose **Create Realm**.
   - Upload the `keycloakConfig.json` file to create the **Prompt** realm.
   - **Create a new user**:
     - Go to **Users** > **Add user** (in the new Prompt realm).
     - Provide a username, email, and your first and last name.
     - Assign the user to the `PROMPT-Admins` group (click **Join Groups**, then select **PROMPT-Admins**).
     - After creating the user, go to **Credentials** to set a password.
     - Add attributes under **User** > **Attributes**:
       - `university_login` → `ab12cde`
       - `matriculation_number` → `01234567`
   - **Generate a Client Secret**:
     - Go to **Clients** > **prompt-server** > **Credentials**.
     - Click **Save**, then **Regenerate** to get a new secret.
     - Copy the generated secret and store it in your environment (e.g., a local `.env` file - important: This is currently not considered by the application itself. The .env file only works when running in docker).  
       You can also paste it into `server/main.go` under `KEYCLOAK_CLIENT_SECRET`, but we recommend using an environment variable.

4. **Backend Setup**  
   - Navigate to the backend folder:

     ```bash
     cd server
     ```

   - Download any required Go dependencies:

     ```bash
     go mod download
     ```

   - Start the backend:

     ```bash
     go run main.go
     ```

   - Make sure the backend can connect to PostgreSQL and Keycloak (check your logs/terminal for any errors).

5. **Client Side Setup**  
   - In a separate terminal, navigate to the client folder:

     ```bash
     cd client
     ```

   - Install the required dependencies:

     ```bash
     yarn install
     ```

   - Run the development server (via Webpack) to launch **all** microfrontends at once:

     ```bash
     yarn run dev
     ```

   - This command usually opens your application in the browser automatically. If it doesn’t, open [http://localhost:3000](http://localhost:3000) (or the port shown in the console).

   - **Running only the core or specific microfrontends**:  
     If you prefer to run only the core frontend or a subset of microfrontends, navigate into the corresponding microfrontend folder and run:

     ```bash
     yarn run dev
     ```

---

You should now have Keycloak (on `localhost:8081`), your PostgreSQL database, the Go backend, and the React microfrontends running. Happy coding!

## Optional: IDE Configuration

- You can use any IDE or text editor for **Go** and **React** development. Popular choices include:
  - [Visual Studio Code](https://code.visualstudio.com/)  
  - [GoLand](https://www.jetbrains.com/go/) for deeper Go integration

## Summary

By installing Go, Node.js, and Yarn, you will be able to:

1. Compile and run the Golang backend.
2. Build and run the React frontend.
3. Develop new features or set up a demo environment.

---

**Happy coding with Prompt!**
