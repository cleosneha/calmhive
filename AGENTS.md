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
- **Color usage:** Never hardcode any color, use it directly from globals.css

---

## Type safety

- Use types folder to declare types and use in my entire application.
- Don't write types directly into files, use types folder for types and interfaces.

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
- **shadcn/ui:** Use [shadcn/ui](https://ui.shadcn.com/) components for consistent, accessible UI primitives. Extend or wrap as needed for custom design. Use `pnpm dlx shadcn@latest add {component-name}` for installation of component which is not already installed.
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
- Use loading.jsx files for route-level loading states
- Use error.jsx files for route-level error boundaries
- Use not-found.jsx files for 404 handling

• Naming Conventions

- Always use kebab-case for all folder and file names (e.g., new-component.jsx, auth-wizard.jsx, user-profile/page.jsx)
- All components should go in /components and be named like new-component.jsx
- All directories must use kebab-case (e.g., components/auth-wizard, utils/format-date.js)
- Don't define custom components within /ui folder
- Favor named exports for components
- Route folders should use kebab-case: user-profile/page.jsx
- Use .jsx for React components and .js for non-React JavaScript files
- Never use camelCase, PascalCase, or snake_case for file or folder names - always use kebab-case

• Performance Optimization

- Minimize Client Component re-renders
- Use Next.js Image component for all images with proper width/height
- Leverage automatic code splitting with App Router
- Use dynamic imports with 'use client' for heavy Client Components
- Implement Suspense boundaries for streaming and loading states
- Use loading.jsx for route-level loading states
- Leverage Next.js caching strategies: fetch cache, router cache, full route cache
- Use LoadingScreen component for loading states

• Next.js Specific Patterns

- Always use Next.js Link component for internal navigation (same-origin links)
- Only use anchor tags (<a>) for external links, email links (mailto:), or file downloads
- Never use anchor tags for internal navigation - always use Link from 'next/link'
- Use Next.js router for programmatic navigation (useRouter from 'next/navigation')
- Implement proper error boundaries with error.jsx files
- Use not-found() function for custom 404s
- Leverage route handlers (API routes) for webhooks, file uploads, or third-party integrations
- Use cookie-based authentication with NextAuth

• Documentation

- Never create README, documentation, or markdown files unless explicitly requested by the user
- Do not add comments or documentation files proactively
- Focus on code implementation rather than documentation

### App Router Structure (Next.js 16)

- Every `page.tsx` should be a server component by default, use `client.tsx` for client component within the same folder if necessary
- Use route groups (folders with parentheses) to organize routes without affecting URL structure: `(auth)`, `(business)`, `(customer)`, `(marketing)`
- Server components should handle data fetching directly
- Use async/await for all server components that fetch data
- Leverage Next.js 16 features: streaming, Suspense boundaries, and server components
- All middleware logic should be defined in `middleware.ts` at root level (Next.js 16 uses `middleware.ts`)
- Use `.tsx` extension for React components and `.ts` for utility files

• API Routes

- Use Next.js API routes (route.js) for webhooks, third-party integrations, and file uploads
- Always use NextResponse.json() for responses with proper status codes
- Return consistent format: { success: boolean, message: string, data?: any }
- Always authenticate requests using getServerSession with authOptions
- Use proper HTTP status codes: 200 (success), 400 (bad request), 401 (unauthorized), 404 (not found), 500 (server error)
- Always wrap API route handlers in try-catch blocks

---

## 🧩 Component Design

- Keep components small and focused. One component = one responsibility.
- Use props for configuration, avoid global state unless necessary.
- Prefer composition over inheritance.
- Use TypeScript for all components and props.
- Document complex components with JSDoc or comments.

---

• Code Style

- Write concise, technical Typescript code
- Use functional and declarative programming patterns; avoid classes
- Prefer iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError)
- Don't repeat functionality or code
- Keep code organized and consistent across the codebase
- Always return data from fetchers and actions in following format: `{ success: boolean, message: string, data?: any }`
- Always wrap fetchers and actions within try-catch block
- Use proper error handling with meaningful error messages

---

## DB choice

- for local, it is postgresql 17 in docker and there will be adminer too.
- for prod , it is neondb.

### PostgreSQL Optimization

- **Indexing:** Create indexes on frequently queried columns (e.g., foreign keys, user IDs) to speed up SELECT queries. Avoid over-indexing to prevent slow INSERT/UPDATE.
- **Query Optimization:** Use EXPLAIN ANALYZE to profile queries; prefer JOINs over subqueries; use LIMIT for large result sets.
- **Connection Pooling:** Use connection pools (e.g., via Prisma or pgBouncer) to manage database connections efficiently.
- **Data Types:** Choose appropriate data types (e.g., UUID for IDs, TEXT for variable strings) to save space and improve performance.
- **Avoid N+1 Queries:** Use Prisma's include or select to fetch related data in one query.
- **Caching:** Implement application-level caching (e.g., Redis) for frequently accessed data to reduce DB load.
- **Batch Operations:** Use bulk inserts/updates instead of individual operations for better performance.
- **Monitoring:** Monitor slow queries with pg_stat_statements; set up alerts for high CPU/memory usage.

## Icons

- use **react icons** in every case. Don't use svg anywhere.

## 🧠 Hooks & Utilities

- Place custom hooks in `src/hooks/` and utilities in `src/utils/`.
- Hooks must start with `use` and follow React hook rules.
- Utilities should be pure functions where possible.

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
