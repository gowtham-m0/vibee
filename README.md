<div align="center">
  <h1>✨ Vibe</h1>
  <p>A Premium Next.js SaaS Chat Application</p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  [![tRPC](https://img.shields.io/badge/tRPC-11-2596be?style=flat-square&logo=trpc)](https://trpc.io/)
</div>

<br />

## 📖 Overview

**Vibe** is a modern, premium SaaS chat application designed with a unique, creative, and non-generic aesthetic. Built on top of the latest web technologies, it provides a seamless and high-quality user experience with robust features, secure authentication, and real-time capabilities.

The application leverages a powerful modern stack to deliver lightning-fast performance, type-safe APIs, and background processing for complex tasks.

## 🚀 Features

- **Premium SaaS UI**: Distinctive, high-quality visual style with carefully crafted color palettes and micro-animations.
- **Secure Authentication**: Seamless integration with [Clerk](https://clerk.com/) covering login, registration, and user management.
- **Type-safe APIs**: End-to-end type safety using [tRPC](https://trpc.io/) and [Zod](https://zod.dev/).
- **Database Modularity**: Relational data models managed by [Prisma](https://www.prisma.io/).
- **AI & Code Execution**: Deep integration with [@e2b/code-interpreter](https://e2b.dev/) for securely executing code in isolated sandboxes.
- **Background Jobs**: Robust workflow management using [Inngest](https://www.inngest.com/).
- **Modern Styling**: Responsive and beautiful interface built with [Tailwind CSS v4](https://tailwindcss.com/) and [Radix UI](https://www.radix-ui.com/).
- **Themes**: Support for both Dark and Light modes out of the box.

## 💻 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Components:** [Radix UI](https://www.radix-ui.com/) & [Class Variance Authority](https://cva.style/docs)
- **Authentication:** [Clerk](https://clerk.com/)
- **API Setup:** [tRPC](https://trpc.io/) + [React Query](https://tanstack.com/query/latest)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Background Tasks:** [Inngest](https://www.inngest.com/)

## 🛠️ Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed along with your preferred package manager (`npm`, `yarn`, `pnpm`, or `bun`).

### Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   git clone https://github.com/gowtham-m0/vibee
   cd vibe
   ```

2. Install the necessary dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. Set up the environment variables:
   Copy `.env.example` to `.env` and fill in the required keys, primarily for Clerk, Prisma, and any AI/E2B keys.
   ```bash
   cp .env.example .env
   ```

4. Generate the Prisma Client and sync your database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎨 Design Philosophy

The design of Vibe departs from typical AI-generated interfaces, leaning into a more bespoke and structured aesthetic. The interface focuses on:
- Intentional color contrast and vibrant accents (e.g., `#C96342` primary).
- Typography that enhances readability and content hierarchy using the Geist font family.
- Fluid and subtle animations using Tailwind and Radix UI primitives.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License

This project is licensed under the [MIT License](LICENSE).
