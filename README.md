# Yoga Studio Manager

A full-stack web application for managing yoga studio activities, including authentication, session management, teacher management, and user participation.

## Prerequisites

Before starting, make sure you have installed:

- Node.js 22+
- Docker and Docker Compose
- npm

---

# Installation

## 1. Clone the repository

```bash
git clone https://github.com/J28u/yoga-studio-manager.git
cd yoga-studio-manager
```

## 2. Install dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd ../frontend
npm install
```

---

# Environment Configuration

The backend uses two environment files:

## Development Environment

Create a `backend/.env` file:

```env
DATABASE_URL="postgresql://yogauser:yogapass@localhost:5432/yogastudio"
JWT_SECRET="your-secret-key"
PORT=8080
NODE_ENV=development
```

## Test Environment

Create a `backend/.env.test` file:

```env
DATABASE_URL="postgresql://yogauser:yogapass@localhost:5433/yogastudio_test"
JWT_SECRET="your-secret-key"
NODE_ENV=test
```

---

# Database Setup

The project uses Docker Compose to start two PostgreSQL databases:

| Database        | Purpose     | Port |
| --------------- | ----------- | ---- |
| yogastudio      | Development | 5432 |
| yogastudio_test | Testing     | 5433 |

Start the containers:

```bash
docker compose up -d
```

Verify that the containers are running:

```bash
docker ps
```

---

# Database Initialization

From the `backend` directory:

## Development Database

Run migrations:

```bash
npm run prisma:migrate
```

Seed the database:

```bash
npm run prisma:seed
```

## Test Database

Apply migrations to the test database:

```bash
npm run migrate:test
```

---

# Running the Application

## Start the Backend

```bash
cd backend
npm run dev
```

Backend available at:

```text
http://localhost:8080
```

## Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend available at:

```text
http://localhost:3000
```

---

# Demo Accounts

## Administrator

```text
Email: yoga@studio.com
Password: test!1234
```

## Regular User

```text
Email: user@test.com
Password: test!1234
```

---

# Running Tests

## Backend Tests (Unit and Integration)

```bash
cd backend
npm test
```

## Frontend Tests

Run Vitest:

```bash
cd frontend
npm test
```

## End-to-End Tests (Cypress)

Open Cypress:

```bash
cd frontend
npx cypress open
```

Run Cypress in headless mode:

```bash
npx cypress run
```

---

# Coverage Reports

## Backend Coverage

Generate the coverage report:

```bash
cd backend
npm run test:coverage
```

The HTML report is generated in:

```text
coverage/index.html
```

## Frontend Coverage

Generate the coverage report:

```bash
cd frontend
npm run test:coverage
```

The HTML report is generated in:

```text
coverage/index.html
```

---

# Useful Scripts

## Backend

```bash
npm run dev
npm run build
npm start
npm test
npm run test:coverage
npm run prisma:migrate
npm run prisma:seed
npm run migrate:test
```

## Frontend

```bash
npm run dev
npm run build
npm test
npm run test:coverage
npx cypress open
npx cypress run
```
