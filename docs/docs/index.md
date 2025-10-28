---
sidebar_position: 1
---

import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

# Welcome to PROMPT Documentation

Welcome to the PROMPT (Project-Oriented Modular Platform for Teaching) documentation. This documentation provides comprehensive guides for users, contributors, and administrators.

## User Guide

The user guide helps instructors and course administrators understand how to use PROMPT to create and manage courses:

<Link to="/docs/user/creating_course">
  <div class="docs-card">
    <h3>📝 Creating a Course</h3>
    <p>Learn how to create a new course in PROMPT</p>
  </div>
</Link>

<Link to="/docs/user/course_configurator">
  <div class="docs-card">
    <h3>🛠️ Course Configurator Guide</h3>
    <p>Visual editor for designing and structuring your course</p>
  </div>
</Link>

<Link to="/docs/user/application">
  <div class="docs-card">
    <h3>📋 Application Course Phase</h3>
    <p>Create application forms and manage student applications</p>
  </div>
</Link>

<Link to="/docs/user/assessment">
  <div class="docs-card">
    <h3>📊 Assessment Course Phase</h3>
    <p>Set up evaluation and competency mapping</p>
  </div>
</Link>

<Link to="/docs/user/mailing">
  <div class="docs-card">
    <h3>📬 Mailing Configuration</h3>
    <p>Configure email communication and templates</p>
  </div>
</Link>

<Link to="/docs/user/templates">
  <div class="docs-card">
    <h3>📚 Templates</h3>
    <p>Create and reuse course templates</p>
  </div>
</Link>

## Contributor Guide

The contributor guide helps developers understand PROMPT's architecture and how to contribute:

<Link to="/docs/contributor/architecture">
  <div class="docs-card">
    <h3>🏗️ Architecture</h3>
    <p>System architecture and design overview</p>
  </div>
</Link>

<Link to="/docs/contributor/guide">
  <div class="docs-card">
    <h3>👨‍💻 Development Guide</h3>
    <p>Get started with development</p>
  </div>
</Link>

<Link to="/docs/contributor/setup">
  <div class="docs-card">
    <h3>⚙️ Setup</h3>
    <p>Development environment setup</p>
  </div>
</Link>

## Administrator Guide

The administrator guide covers deployment and production setup:

<Link to="/docs/admin/productionSetup">
  <div class="docs-card">
    <h3>🚀 Production Setup</h3>
    <p>Deployment and production configuration</p>
  </div>
</Link>

<style>{`
  .docs-card {
    padding: 1.5rem;
    margin: 1rem 0;
    border: 1px solid var(--ifm-color-emphasis-200);
    border-radius: 8px;
    transition: all 0.2s;
    text-decoration: none;
    display: block;
  }

  .docs-card:hover {
    border-color: var(--ifm-color-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .docs-card h3 {
    margin: 0 0 0.5rem 0;
    color: var(--ifm-color-primary);
  }

  .docs-card p {
    margin: 0;
    color: var(--ifm-color-content-secondary);
  }
`}</style>