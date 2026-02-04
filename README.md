# NexusHCM

# HumanCapital-Hub 

HumanCapital-Hub is a robust, full-stack Human Capital Management (HCM) portal designed to simplify and automate employee operations. It features a sophisticated Role-Based Access Control (RBAC) system, allowing for distinct workflows for Managers and Employees.

## Features

### Employee Dashboard
* **Self-Service:** Add, edit, and manage personal profile details.
* **Attendance Tracking:** Log daily attendance with real-time status updates.
* **Salary Insights:** View detailed personal salary breakdowns.
* **Leave Management:** Apply for leaves and track status (Pending, Approved, Rejected).
* **Employee Directory:** View basic details of colleagues (Read-only access).

### Manager Dashboard
* **Administrative Control:** Full CRUD access to view and edit all employee records.
* **Workforce Monitoring:** Real-time monitoring of attendance and salary data across the team.
* **Leave Approvals:** Dedicated interface to review, approve, or reject employee leave requests.

## Tech Stack

### Frontend
* **React.js (Vite):** Fast, component-based UI development.
* **Tailwind CSS:** Modern utility-first styling for a responsive and professional look.
* **Shadcn UI:** High-quality accessible UI components.
* **Wouter:** Lightweight routing for smooth navigation.

### Backend
* **Node.js & Express:** Scalable server-side logic and RESTful API development.
* **PostgreSQL:** Relational database for structured data persistence.
* **Drizzle ORM:** TypeScript-optimized Object-Relational Mapping for database safety.
* **Zod:** Robust schema validation for API requests and database integrity.

## How It Works (Setup Steps)

### 1. Prerequisites
* Node.js (v20+)
* PostgreSQL 18

### 2. Database Configuration
1. Open **pgAdmin 4** and create a new database named `EMP`.
2. Ensure the PostgreSQL service is running on port `5432`.

### 3. Environment Setup
Create a `.env` file in the root directory and add your connection string:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@127.0.0.1:5432/EMP


4. Installation
Install all required dependencies:
Bash
npm install

5. Database Sync
Push the project schema to your local PostgreSQL instance:
PowerShell
$env:DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@127.0.0.1:5432/EMPdatabase"; npx drizzle-kit push
6. Run the Application
Start the development server:

PowerShell
$env:NODE_ENV="development"; npx tsx server/index.ts
The application will be live at http://localhost:5000.

Authentication & Authorization
The system uses Passport-local for secure authentication. User roles (Manager vs. Employee) are determined at signup and strictly enforced on both the Frontend (via protected routes) and Backend (via middleware).

### About Myself
 I am Passaniate Full Stack web Developer specializied in the MERN Stack. loves to build the things from the Scratch and Committed to develop scalable,Secure, production-ready solutions.
---
