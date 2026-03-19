# AI Assistant Instructions for pyform

## Project Context
You are working on **pyform**, a production-ready Next.js 15+ TypeScript SaaS application. 

**Core Philosophy:** 
Our development philosophy is heavily focused on **aesthetic and functional simplicity, without leaving aside the robustness of the infrastructure**. Every solution must be elegant, clean, and provide a premium user experience, while being supported by rock-solid backend architecture. **Code quality, strict data integrity, and seamless internationalization (i18n)** are non-negotiable standards required to maintain consistency with our high quality expectations.

## Architecture Overview

### Primary Stack & Architecture

Here is the detailed list of technologies, libraries, and their primary functions within the architecture:

- **Framework & Core**: 
  - **Next.js 15+ (App Router)** & **React 19+**: The architecture follows a server-first approach utilizing React Server Components for performance, falling back to client components (`"use client"`) when interactivity is needed.
  - **TypeScript 5.9+**: Enforces strict typing across the entire codebase.

- **State Management & Data Fetching**: 
  - **Zustand**: Fast and scalable global client-side state management.
  - **React Query (@tanstack/react-query)**: Used for robust server-state management, caching, and data synchronization.
  - **Axios**: HTTP client for structured API communications.

- **Styling & UI Component Ecosystem** _(Focused on Premium Aesthetics)_:
  - **TailwindCSS 4.1+**: Core utility-first styling.
  - **DaisyUI 5.0+**: Provides a base layer of pre-designed utility components.
  - **HeroUI (@heroui/*)**: Specialized, highly-polished components (buttons, cards, drawers, dropdowns, etc.) used to elevate the semantic UI.
  - **Lucide React**: Supplies clean, modern, and consistent iconography.

- **Animations & Micro-interactions**:
  - **Framer Motion**: Declarative animations for smooth component entries and layout transitions.
  - **GSAP & @gsap/react**: Advanced, timeline-based procedural animations for a highly dynamic, "wow-factor" interface.
  - **Canvas Confetti**: High-delight celebratory micro-interactions.

- **Database & Data Integrity**:
  - **MongoDB & Mongoose**: Core database layer and ODM. Enforces strict schema definitions and validation for all backend operations (`connectMongo()` pattern).
  - **Zod**: Used extensively for runtime schema validation, data parsing, and ensuring bulletproof type safety at API boundaries (e.g., validating request bodies).

- **Authentication & Security**:
  - **NextAuth v5 (beta) & @auth/mongodb-adapter**: Session handling and OAuth/Email provider management. Focused largely on simple, secure Magic Link authentication.

- **Infrastructure & External Services**:
  - **Stripe**: Handles payments, product checkout flows, and automated webhook processing.
  - **AWS SDK S3 (@aws-sdk/client-s3)**: For direct object storage and file management, including external compatible storage systems like MinIO.
  - **Resend & Nodemailer**: Redundant/robust transactional email delivery systems.
  - **Crisp SDK**: Real-time customer support chat widget integration.

- **Internationalization (i18n), SEO, & Content**:
  - **@formatjs/intl-localematcher & negotiator**: Power the middleware to correctly detect user languages and enforce locale routing. Utilizes `@internationalized/date` for localized dates.
  - **MDX (@next/mdx)**: For rendering markdown-based content (e.g., blogs or documentation).
  - **Next-Sitemap**: Automated generation of sitemaps for SEO integrity.

- **User Feedback Tooling**:
  - **React Hot Toast**: Non-intrusive, global notification system for success/error states.
  - **React Tooltip**: For progressive disclosure of information without cluttering the UI.

### Project Structure
```text
├── app/                    # Next.js App Router pages and API routes (includes [lang] parameter for i18n)
├── components/             # Reusable UI components
├── libs/                   # Utility libraries and configurations
├── models/                 # MongoDB/Mongoose models
├── types/                  # TypeScript type definitions
└── config.ts               # Centralized configuration
```

## Development Guidelines

### 1. Code Quality & Simple Aesthetics
- **Simplicity First**: Write clean, self-documenting code. Avoid over-engineering. If a UI element can be simplified while remaining functional and beautiful, do it.
- **Premium UI/UX**: Interfaces must feel responsive, dynamic, and state-of-the-art. Use harmonious color palettes, modern typography, and smooth micro-animations.
- **Always use TypeScript**: Provide proper, strict type definitions for all functions, components, and data structures. Avoid `any`.
- **Follow Next.js 15+ patterns**: Use App Router, Server Components by default, and `"use client"` only when interactivity is explicitly required.

### 2. Data Integrity & Robust Infrastructure
- **Atomic Operations**: When updating critical data (e.g., payments, user credits, or order tracking), guarantee atomic updates and handle race conditions.
- **Database Operations**: Always connect to MongoDB using `connectMongo()` before DB operations. Implement robust error handling and ensure schemas strictly validate all data.
- **Error Handling**: Use `try-catch` blocks, validate request bodies, and return standard HTTP status codes. Gracefully handle edge cases to protect system integrity.

### 3. Internationalization (i18n)
- **No Hardcoded Strings**: Never hardcode user-facing text in components. Always use the established dictionary system.
- **Consistent Updates**: Ensure all supported languages are updated concurrently when adding new features.
- **Locale Routing**: Utilize the `[lang]` route parameters or headers to adapt the UI and content dynamically according to user preferences.

## Common Tasks and Patterns

### Component Development
- Use functional components with hooks. Include proper TypeScript interfaces for props.
- Implement responsive design with Tailwind breakpoints.
- Include thoughtful loading states (skeletons, spinners) and error handling that isn't disruptive.

### API Route Development
- Validate inputs using proper schemas before processing.
- Connect to MongoDB explicitly.
- Maintain accurate and consistent JSON responses across all endpoints.

### Authentication & Payments
- Protect routes and check session status for sensitive data.
- Webhooks (handling Stripe events) must securely verify signatures. Update user access and payment records with 100% precision.

## Configuration Management
- All app configuration is centralized in `/config.ts`.
- Environment variables are strictly typed and validated. 

## When Helping with This Codebase
1. **Understand our core tenets**: You are building **pyform**. Quality, simple yet beautiful UI, and unbreakable backend logic are your main priorities.
2. **Follow existing patterns**: Study how similar functionality (like our Kanban boards or Magic Link auth) is implemented and maintain consistency.
3. **Keep i18n in mind**: Remember that users will view the app in multiple languages.
4. **Prioritize Data Integrity**: Consider edge cases. What happens if an API call fails mid-way? Ensure the database never enters an invalid state.
5. **Aesthetics Matter**: If you introduce a new UI component, it must look premium and align with pyform's polished visual identity.

Remember: Always prioritize security, proper error handling, data consistency, and a stunning user experience in any modifications or additions.