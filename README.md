# Flowboard

![Flowboard Architecture / Cover](https://via.placeholder.com/1000x400/0f172a/6366f1?text=Flowboard+-+Real-time+Workspace)

Flowboard is a full-stack, real-time collaborative task management SaaS. Designed to help teams organize projects efficiently, it features multi-tenant workspaces, interactive drag-and-drop Kanban boards, and strict role-based access control.

## 🚀 Key Features

*   **Multi-Tenant Workspaces**: Create isolated environments for different teams, campaigns, or clients.
*   **Real-time Kanban Boards**: Highly responsive drag-and-drop task management powered by `@dnd-kit/sortable` and `Socket.io` for live multi-user synchronization.
*   **Role-Based Access Control (RBAC)**: Secure workspaces with `Owner`, `Admin`, and `Member` permissions affecting what users can edit, delete, or create.
*   **Activity Feeds & Audit Logging**: Track every task movement, member invitation, or comment instantly with real-time websocket broadcasts and a database-backed activity log.
*   **Subtasks & Comments**: Break down large tasks with checklists and collaborate seamlessly via task-specific comment threads.
*   **Modern Premium UI**: Built with Chakra UI v3, utilizing dark-mode aesthetics, dynamic micro-animations, and glassmorphism.

## 🛠️ Tech Stack

**Frontend (Client)**
*   [Next.js](https://nextjs.org/) (App Router)
*   [React](https://reactjs.org/)
*   [Chakra UI](https://chakra-ui.com/) (v3)
*   [Clerk](https://clerk.dev/) (Authentication)
*   `@dnd-kit/sortable` (Drag & Drop)
*   `axios` & `lucide-react`

**Backend (API & WebSockets)**
*   [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
*   [Socket.io](https://socket.io/) (Real-time events)
*   [PostgreSQL](https://www.postgresql.org/) (Relational Database)
*   [Prisma ORM](https://www.prisma.io/) (Database Access & Migrations)
*   `helmet` & `express-rate-limit` (Security headers and rate limiting)

## 📂 Project Structure

This project is a monorepo containing both the web client and the API server.

```text
flowboard/
├── apps/
│   ├── web/      # Next.js Frontend application
│   └── api/      # Node.js/Express Backend & WebSockets
└── README.md
```

## 💻 Getting Started

### Prerequisites

*   Node.js (v18+)
*   PostgreSQL running locally or via a cloud provider (e.g., Supabase, Neon)
*   A [Clerk](https://clerk.dev/) account for authentication

### Environment Variables

**Backend (`apps/api/.env`)**:
```env
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/flowboard"
FRONTEND_URL="http://localhost:3000"
CLERK_SECRET_KEY="your_clerk_secret_key"
```

**Frontend (`apps/web/.env.local`)**:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/flowboard.git
   cd flowboard
   ```

2. Boot up the Backend API:
   ```bash
   cd apps/api
   npm install
   npm run prisma:generate
   npm run prisma:push
   npm run dev
   ```

3. Boot up the Frontend Client (in a new terminal):
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```

4. Access the application:  
   Open [http://localhost:3000](http://localhost:3000) in your browser.

