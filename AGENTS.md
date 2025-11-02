# Tech Stack Overview

This document outlines the technologies, libraries, and APIs used to build the Gemini Text-to-Speech application. The application is a modern, client-side single-page application (SPA) that runs entirely in the browser.

## Core Technologies

- **TypeScript**: The primary programming language. It's a superset of JavaScript that adds static typing, enhancing code quality, readability, and developer productivity by catching errors during development.

- **React**: A declarative JavaScript library for building user interfaces. The application is built using:
  - **Functional Components**: The entire UI is composed of functional components.
  - **React Hooks**: State and lifecycle features are managed using hooks like `useState`, `useCallback`, and `useMemo` for efficient state management and performance optimization.

## Styling

- **Tailwind CSS**: A utility-first CSS framework for rapid UI development. Styling is applied directly within the JSX markup using utility classes, which allows for highly customizable designs without writing custom CSS. It is loaded via a CDN in `index.html`.

## Backend Services & API

- **Google Gemini API**: The core backend service that provides the text-to-speech functionality.
  - **Model**: The application specifically uses the `gemini-2.5-flash-preview-tts` model.
  - **SDK**: The official `@google/genai` JavaScript library is used to interact with the Gemini API, simplifying the process of making API requests for speech generation.

## Browser APIs (Native Web APIs)

- **Web Audio API**: Used for decoding and playing the audio stream received from the Gemini API. The application creates an `AudioContext` to handle the raw PCM audio data and play it back through the user's speakers.

- **Blob & File API**: Used to construct a downloadable `.wav` file from the raw audio data. This allows users to save the generated speech locally.

## Development Environment & Module System

- **ES Modules (ESM) with Import Maps**: The application does not use a traditional build tool or bundler (like Webpack or Vite). Instead, it leverages modern browser capabilities:
  - **ES Modules**: JavaScript files are structured as modules (`import`/`export`).
  - **Import Maps**: Defined in `index.html`, import maps tell the browser how to resolve module specifiers (e.g., where to find the `react` or `@google/genai` packages), allowing for a build-less development setup.

## Summary Table

| Category                | Technology                                | Role in Application                                       |
| ----------------------- | ----------------------------------------- | --------------------------------------------------------- |
| **Language**            | TypeScript                                | Provides static typing for robust and maintainable code.  |
| **UI Framework**        | React                                     | Builds the interactive and component-based user interface.|
| **Styling**             | Tailwind CSS                              | Enables rapid, utility-first styling directly in JSX.     |
| **Backend API**         | Google Gemini API                         | Powers the core text-to-speech conversion.                |
| **API Client**          | `@google/genai` SDK                       | Facilitates communication with the Gemini API.            |
| **Audio Playback**      | Web Audio API                             | Decodes and plays the generated audio in the browser.     |
| **File Generation**     | Blob & File API                           | Creates a `.wav` file for users to download.              |
| **Module System**       | Import Maps & ES Modules                  | Manages dependencies directly in the browser without a build step. |
