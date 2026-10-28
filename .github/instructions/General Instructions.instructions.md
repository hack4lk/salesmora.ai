---
description: General instructions for the agent to follow when interacting with the project.
applyTo: "**" # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---

<!-- Tip: Use /create-instructions in chat to generate content with agent assistance -->

- always follow the project's coding guidelines and conventions when generating or modifying code.
- ensure all code changes are consistent with the existing code style and structure.
- write clear, maintainable, and well-documented code.
- prioritize readability and simplicity in code implementations.
- validate inputs and handle errors gracefully.
- follow best practices for security and performance.
- always ask questions when requirements or context are unclear.
- strive for efficient and optimized solutions without sacrificing code clarity.
- rely on the established prototype files when creating or updating components.
- ensure that role-based access control and permission checks are correctly implemented and enforced.
- create stories and tests for new features and components to ensure proper functionality and coverage.
- review and update documentation to reflect changes in the codebase.
- When creating new components, new features or updating functionality, follow this these steps:
  - Plan and design the feature or component before implementation interactively with stakeholders and team members.
  - After approved plan, create the necessary steps to implement the feature or component, including coding, testing, and documentation.
  - Do one step at a time and ask for review and feedback from team members before proceeding to the next step.
  - Always create storied components if the component is part of a page to ensure proper documentation and testing.
  - After all components have been created, create the page
  - After the page has been created, integrate the page into the application or relevant module.
  - Next create any chat assistant logic that needs to be implemented for the feature or component.
  - Finally, conduct thorough testing and review to ensure the feature or component works as intended and meets quality standards.
