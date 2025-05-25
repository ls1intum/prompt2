# 🛠️ Course Configurator Guide

📺 **Video Tutorial**: [Watch here](https://live.rbg.tum.de/w/artemisintro/60490)

The **Course Configurator** is a visual editor that helps you design and structure your course by arranging phases and defining how students and data move through them.

---

## 💡 What is the Course Configurator?

The Course Configurator allows you to build and customize your course using a **drag-and-drop interface**. A course consists of multiple **phases**, which you can arrange to control both:

* The **order students progress through the course**
* The **flow of data** between course phases

```{figure} ./images/course_configurator.png
---
alt: Course Configurator
width: 800px
name: Course Configurator
---
````

---

## 🖱️ Getting Started

Here are the three main steps to set up your course:

### 1. ➕ Add Phases

Use the sidebar to browse available course phases.
**Drag and drop** phases onto the canvas to add them to your course structure. The initial phase has to be an application phase. After that you can drag any phase into the canvas. 

### 2. 🔵 Connect Student Flow

Define the **order** in which students progress through the course:

* Click and drag between the 🔵 **blue dots** on phases to connect them
* These connections determine how students advance from one phase to the next

### 3. 🟢🟣 Configure Data Flow

Many phases **produce output data** (like scores or preferences) that other phases use as **inputs**.

* You can link:

  * 🟢 **Green dots** for participant-level data
  * 🟣 **Purple dots** for phase-level data

This enables **inter-phase communication** — for example, using application scores in a later matching phase.

---

## ⚠️ Connection Rules

The configurator enforces a **linear and forward-only structure** for clarity and consistency:

* ✅ Students must follow a **single, straight path** through the phases.
* 🚫 **Loops** or **parallel branches** are not supported.
* ✅ **Data connections** can only go **forward**, to later phases in the student flow.

---

## ✅ Summary

| Action                   | Icon/Dot      | Meaning                                |
| ------------------------ | ------------- | -------------------------------------- |
| Connect student flow     | 🔵 Blue Dot   | Defines the sequence of phases         |
| Connect participant data | 🟢 Green Dot  | Shares data per student between phases |
| Connect phase-level data | 🟣 Purple Dot | Shares general data between phases     |

---

If you're new to course setup, you can also refer to the [course creation guide](./creating_course.md) for an introduction.
