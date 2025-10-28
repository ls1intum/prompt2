---
sidebar_position: 1
---

# Client Guidelines

## 0. General

**Project Context:**  
This project is a React project. Please adhere to the React style guide and rules as described in [React Rules](https://react.dev/reference/rules).

## 1. Naming Conventions

- **PascalCase** should be used for:
  - Folders that represent a React component (e.g., `ApplicationAssessment`)
  - React component files. **Important:** Use descriptive names. For example:
    - A page should be suffixed with `Page` (e.g., `ApplicationAssessmentPage`)
    - A dialog should be suffixed with `Dialog` (e.g., `ConfirmationDialog`)

- **camelCase** should be used for:
  - Folders that do **not** represent a React component
  - Function names
  - Properties and local variables

- **SCREAMING_SNAKE_CASE** should be used for constants.

- Use whole words in names when possible.

## 2. Folder Structure

For each (sub-)component, use the following folder structure:

- `components`  -- Contains sub-components exclusively needed for this component
- `hooks`
- `interfaces`
- `pages`       -- Only at the highest level (we maintain one sub-level in our sidebar hierarchy)
- `utils`
- `zustand`

## 3. Installing Packages

When adding packages, follow these guidelines:

1. **Installation Location:**  
   - The project utilizes micro-frontends in a mono-repo style.
   - Before installing a package, verify if any other micro-frontend already uses it. If so, move the dependency to `clients/package.json` to ensure consistent package versions.
   - If the package is specific to your micro-frontend, install it within your micro-frontend's subfolder.

2. **Package Maintenance:**  
   - Be cautious of recommendations, especially when working with LLMs, that suggest outdated or unmaintained packages, as they can introduce security issues.
   - Before installing a dependency, check its status on [npmjs.org](https://npmjs.org). Verify the last published date and download counts. If a package was last published several years ago, consider alternative options.

## 4. Types and Interfaces

- Do not export types or functions unless they are needed across multiple components.
- All core types are maintained in the `prompt-lib` repository. Modify these with caution.
- Within a file, place type definitions at the beginning.
- **Best Practice:** Prefer `interface` over `type` for defining structures, except where an interface is not applicable.
  ```typescript
  // Incorrect: Using a type alias for a React component structure
  type Application = {
      id: string;
      applicationAnswers: (ApplicationAnswerText | ApplicationAnswerMultiSelect)[];
  }

  // Correct: Using an interface for a React component structure
  interface Application {
      id: string;
      applicationAnswers: (ApplicationAnswerText | ApplicationAnswerMultiSelect)[];
  }

  // Also allowed (when interface cannot be used):
  type ApplicationAnswer = ApplicationAnswerText | ApplicationAnswerMultiSelect;
  ```

- Enforce strict typing: **Never use `any`!**
- Avoid using anonymous data structures.

  ```typescript
  type Application = {
      id: string;
      applicationAnswers: (ApplicationAnswerText | ApplicationAnswerMultiSelect)[];
  }

  // Incorrect: Type assertion hides potential errors
  const application = { id: 4, applicationAnswers: [] } as Application;

  // Correct: This will throw a type error during compilation because '4' is not a string
  const application: Application = { id: 4, applicationAnswers: [] };
  ```
