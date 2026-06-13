# Vue Vben Admin - Project Context

Vue Vben Admin is a production-ready front-end solution for middle and back-end templates, built with the latest web technologies.

## Project Overview

- **Main Technologies:** Vue 3, Vite, TypeScript, Ant Design Vue, Pinia, and UnoCSS.
- **Architecture:** Monorepo managed with `pnpm` workspaces and `turbo` for task orchestration.
- **Version:** 2.11.5

## Monorepo Structure

The project is organized into several key directories as defined in `pnpm-workspace.yaml`:

- **Root:** Contains the primary application source in `src/`.
- **`apps/`**: Additional applications, including a Koa-based `test-server` and experimental web versions.
- **`packages/`**: Shared libraries and utilities used across the workspace (e.g., `@vben/hooks`, `@vben/types`).
- **`internal/`**: Shared configurations for the build system (`vite-config`), linters (`eslint-config`, `stylelint-config`), and TypeScript (`ts-config`).

## Building and Running

### Prerequisites

- **Node.js:** >= 18.12.0
- **Package Manager:** `pnpm` >= 9.0.2

### Key Commands

- **Initialize:** `pnpm install` (or `pnpm bootstrap`)
- **Development:** `pnpm dev` (or `pnpm serve`) - Starts the main application with Vite.
- **Build:** `pnpm build` - Build the project for production.
- **Type Check:** `pnpm type:check` - Run `vue-tsc` to check types.
- **Linting:**
  - `pnpm lint` - Run all linters via Turbo.
  - `pnpm lint:eslint` - Run ESLint on `src` and `mock` directories.
  - `pnpm lint:prettier` - Format code with Prettier.
  - `pnpm lint:stylelint` - Run Stylelint on styles.
- **Mock Server:** The project uses `vite-plugin-mock` for development API mocking. A separate `test-server` is available in `apps/test-server`.

## Development Conventions

- **Code Style:** Strictly enforced via ESLint, Stylelint, and Prettier.
- **Commits:** Follows [Conventional Commits](https://www.conventionalcommits.org/). Use `pnpm commit` to use the interactive `cz-git` CLI.
- **Workflow:**
  - `husky` and `lint-staged` are used to run linters on staged files before commit.
  - `turbo` is used to optimize builds and linting by caching results.
- **Internationalization:** i18n is supported via `vue-i18n`, with locale files located in `src/locales/`.

## Key Directories (Root)

- `src/api`: API service definitions.
- `src/components`: Global reusable components.
- `src/hooks`: Custom Vue composition functions.
- `src/layouts`: Page layout components.
- `src/router`: Vue Router configuration.
- `src/store`: Pinia store modules.
- `src/views`: Page components.
- `mock/`: Mock data for development.
