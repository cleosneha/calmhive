# CalmHive Coding Agent Guide

This document provides comprehensive standards and strategies for coding agents contributing to CalmHive. Follow these guidelines to ensure code quality, maintainability, and a consistent developer experience.

---

## Package Manager

- pnpm.

---

## 🧑‍💻 General Coding Principles

- **DRY (Don't Repeat Yourself):** Avoid code duplication. Abstract reusable logic into functions, hooks, or components.
- **KISS (Keep It Simple, Stupid):** Prefer simple, readable solutions over clever but complex code.
- **YAGNI (You Aren't Gonna Need It):** Only implement features and abstractions that are currently required.
- **Modularity:** Break code into small, focused, and reusable modules/components.
- **Performance:** Use the latest Next.js optimizations (e.g., Server Components, Suspense, streaming, caching, parallel routes).
- **Accessibility:** Ensure all UI is accessible (ARIA, keyboard navigation, color contrast).
- **Responsiveness:** All UI must be fully responsive and mobile-friendly.

---

## 🗂️ Directory & Naming Conventions

- **Folders:** `lowercase` + `kebab-case` (e.g., `user-profile/`)
- **React Components:** `PascalCase` (e.g., `UserProfile.tsx`)
- **Hooks/Utils:** `camelCase` (e.g., `useAuth.ts`, `formatDate.ts`)
- **Routes:** `kebab-case` (e.g., `/user-profile/settings`)
- **Tests:** Same name as the file + `.test.tsx` (e.g., `UserProfile.test.tsx`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_LOGIN_ATTEMPTS`)
- **Types/Interfaces:** `PascalCase` (e.g., `UserSession`)
- **Environment Variables:** `UPPER_SNAKE_CASE` (e.g., `NEXT_PUBLIC_API_URL`)

---

## 🏗️ Project Structure

- Place all source code in the `src/` directory.
- Use feature-based folders for grouping related files (e.g., `journal/`, `plan/`, `onboarding/`).
- Shared UI components go in `src/components/shared/`.
- Place hooks in `src/hooks/`, utilities in `src/utils/`, and types in `src/types/`.
- API routes live in `src/app/api/`.
- Styles are managed via Tailwind CSS and global styles in `globals.css`.

---

## 🎨 UI & Styling

- **Tailwind CSS:** Use Tailwind utility classes for all styling. Prefer arbitrary values for custom colors (e.g., `text-[var(--ch-sage-dark)]`).
- **shadcn/ui:** Use [shadcn/ui](https://ui.shadcn.com/) components for consistent, accessible UI primitives. Extend or wrap as needed for custom design.
- **Responsiveness:** Always use responsive classes (`sm:`, `md:`, `lg:`, etc.).

---

## ⚡ Next.js Best Practices

- Use **Server Components** by default. Only use **Client Components** when state, effects, or browser APIs are required.
- Wrap client components inside server components wherever necessary, for this you can create two files inside a folder - "pagename-client".
- Use the latest Next.js features: parallel routes, loading UI, streaming, and caching.
- Use `app/` directory routing and layouts.
- Use `Metadata` for SEO in each route.
- Use `fetch` with caching strategies for data fetching.
- Use environment variables for secrets and configuration.

---

## 🧩 Component Design

- Keep components small and focused. One component = one responsibility.
- Use props for configuration, avoid global state unless necessary.
- Prefer composition over inheritance.
- Use TypeScript for all components and props.
- Document complex components with JSDoc or comments.

---

## DB choice

- for local, it is postgresql 17 in docker and there will be adminer too.
- for prod , it is neondb.

## Icons

- use **react icons** in every case.

## 🧠 Hooks & Utilities

- Place custom hooks in `src/hooks/` and utilities in `src/utils/`.
- Hooks must start with `use` and follow React hook rules.
- Utilities should be pure functions where possible.

---

## 🧪 Testing

- Write tests for all logic-heavy components, hooks, and utilities.
- Use the same name as the file + `.test.tsx` or `.test.ts`.
- Prefer [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/).

---

## 🔒 Security & Privacy

- Never expose secrets or sensitive data in the client.
- Validate and sanitize all user input.
- Follow privacy-first principles: store minimal data, prefer local storage for sensitive info.

---

## 📝 Documentation

- Document all public APIs, complex logic, and non-obvious decisions.
- Use clear, concise comments and JSDoc where appropriate.

---

## ✅ Code Review Checklist

- [ ] Follows directory and naming conventions
- [ ] DRY, modular, and readable
- [ ] Responsive and accessible UI
- [ ] Uses Tailwind and shadcn/ui
- [ ] Uses latest Next.js features
- [ ] Proper use of client/server components
- [ ] TypeScript types are correct
- [ ] Tests are present for logic
- [ ] No secrets or sensitive data exposed
- [ ] Well-documented

---

By following these standards, CalmHive code will remain clean, maintainable, and delightful for both users and developers.
