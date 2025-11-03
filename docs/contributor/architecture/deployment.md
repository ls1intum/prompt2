---
sidebar_position: 2
---

# 🚀 Deployment Architecture

This section provides an overview of the **deployment structure** for the PROMPT 2 platform, illustrating how the system components are hosted, served, and interconnected in a production environment.



import DeploymentImage from './img/deployment.png';

<img src={DeploymentImage} alt="Deployment Diagram of the PROMPT 2 System" />

> Deployment Diagram of the PROMPT 2 System. The system follows a client-server architecture with the core server running on a virtual machine alongside its database and mail service. The core client runs in the browser and dynamically loads microfrontends from course phase services. Blue indicates core components, green represents course phase service components, and grey denotes external tools or off-the-shelf systems.

## 🧱 Core Components

The PROMPT platform is based on a **client-server architecture**, with the core components forming the foundation of the system.

### 🖥️ Prompt Core Server

The **Prompt Core Server** is deployed on a virtual machine and includes:

* A **Golang-based application**
* A **PostgreSQL database** for persistent storage
* A **Postfix SMTP mail service** for sending application-related emails

The Core Server communicates:

* With the database using **JDBC**
* With the mail service via **SMTP**
* With client applications through **REST APIs**, routed by the **Traefik reverse proxy**

### 🌐 Prompt Core Client

The **Prompt Core Client** is a **React application** running in the user’s browser. It provides the foundational user interface for students and instructors. This client **dynamically loads the microfrontends** provided by the different course phases services at runtime. These microfrontends are provided by course phase services and integrated directly into the Core Client interface.

---

## 🧩 Course Phase Services

Course phase services extend the core platform by adding custom functionality for individual phases such as the Intro Course or Matching.

These services can be build in two ways:

### 1. **Client-Only Course Phase Services**

Some course phases consist only of a microfrontend (React application) without any supporting server application or dedicated storage. In this case:

* The microfrontend is hosted by the **Core Server's reverse proxy**
* The service interacts entirely with the Core Server’s APIs and storage. This is only possible for course phase services, which do not require editors or students to store data. 

### 2. **Client-and-Server Course Phase Services**

Complex course phases may require their own server side logic and data storage. 
In this case, the course phase service provides a microfrontend which interacts with the custom course phase server-side component. 
