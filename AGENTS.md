# Repository Guidelines

## Project Structure & Module Organization

The Vue 3 application lives in `src/`. Put routed pages in `src/views`, reusable UI in `src/components`, API clients in `src/api`, Pinia stores in `src/store`, and routing definitions in `src/router`. Static source assets belong in `src/assets`; files copied unchanged at build time belong in `public/`. Mock API handlers are under `mock/`.

This is a pnpm workspace. Shared runtime packages live in `packages/` (for example, `packages/hooks`), build and lint presets live in `internal/`, and the standalone test server is in `apps/test-server`. Global declarations are maintained in `types/`.

## Build, Test, and Development Commands

- `pnpm install` — install workspace dependencies; pnpm 9 and Node.js 18.12+ are required.
- `pnpm dev` — start the Vite development server.
- `pnpm build` — create the production bundle in `dist/`.
- `pnpm build:test` — build with the test-mode environment.
- `pnpm type:check` — run Vue and TypeScript checks without emitting files.
- `pnpm lint` — run workspace lint tasks through Turbo.
- `pnpm lint:eslint`, `pnpm lint:stylelint`, or `pnpm lint:prettier` — fix script, style, or formatting issues.

Run `pnpm type:check && pnpm build` before opening a pull request; CI checks both on Node 18 and 20.

## Coding Style & Naming Conventions

Use TypeScript and Vue single-file components, two-space indentation, LF line endings, and a 100-character line target. Prettier enforces single quotes, semicolons, and trailing commas; ESLint extends `@vben`, while Stylelint covers Vue, CSS, Less, and SCSS.

Name Vue components in PascalCase (`BasicModal.vue`), composables with a `use` prefix (`useUpload.ts`), and tests `*.test.ts`. Follow the nearest module’s existing folder and export pattern.

## Testing Guidelines

The repository contains Vitest-style tests under `__test__/`, but currently exposes no root `test` script and does not install Vitest. For every change, run type checking, linting, and a production build. When adding executable unit coverage, colocate focused `*.test.ts` files with the module and include any required test-runner configuration in the same change.

## Commit & Pull Request Guidelines

Use Conventional Commits: `type(scope): imperative subject`, such as `fix(api): handle request timeout`. Allowed types include `feat`, `fix`, `docs`, `test`, `refactor`, `build`, and `chore`; `pnpm commit` opens the guided prompt.

Keep pull requests focused, preserve the checklist in `.github/pull_request_template.md`, explain motivation and behavior changes, link related issues, and include screenshots for visible UI changes. Confirm formatting, self-review, documentation, and local validation before submission.
