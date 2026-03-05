# Kanban App

A modern Kanban application built with Next.js 16, React 19, and SQLite. This application allows you to manage tasks, projects, and team members efficiently with a local database.

## Features

*   **Kanban Board:** Visualize your workflow with a drag-and-drop interface (powered by `@hello-pangea/dnd`).
*   **Issue Tracking:** Create, edit, and manage issues with detailed descriptions, tags, and assignees.
*   **Project Management:** Organize work into projects with custom prefixes (e.g., KAN-001).
*   **Team Management:** Manage people, assignees, and reporters.
*   **General Settings:** Configure organization details, branding colors, and contact information via a dedicated settings page.
*   **Local Database:** Uses SQLite (`better-sqlite3`) for fast and reliable local data storage.
*   **Responsive Design:** Styled with Bootstrap 5.

## Tech Stack

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Database:** SQLite (via `better-sqlite3`)
*   **Styling:** Bootstrap 5 & Bootstrap Icons
*   **State Management:** Zustand
*   **Drag & Drop:** @hello-pangea/dnd
*   **Diagrams:** React Flow

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm, yarn, or pnpm

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd njs-my-kanban-app
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Database Setup

Before running the application, you need to initialize the SQLite database with the schema and seed data.

Run the seed script:

```bash
npx tsx scripts/seed.ts
```

This will create a `kanban.db` file in the root directory and populate it with initial data (users, projects, tags, issues, and general settings).

### Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
