# IMS Backend — Inventory Management System

A production-ready REST API for a full-featured Inventory Management System built with **Node.js**, **Express**, **TypeScript**, **MongoDB** (Mongoose), and **Zod** validation. Designed as a modular monolith with clean separation of concerns, RBAC, Cloudinary file storage, Stripe payments, audit logging, and more.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Server](#running-the-server)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Users (Admin)](#users-admin)
  - [Categories](#categories)
  - [Suppliers](#suppliers)
  - [Products](#products)
  - [Inventory](#inventory)
  - [Purchases](#purchases)
  - [Sales](#sales)
  - [Customers](#customers)
  - [Expenses](#expenses)
  - [Payments (Stripe)](#payments-stripe)
  - [File Uploads (Cloudinary)](#file-uploads-cloudinary)
  - [Reports & Dashboard](#reports--dashboard)
  - [Audit Logs](#audit-logs)
- [Authentication & Authorization](#authentication--authorization)
  - [JWT Tokens](#jwt-tokens)
  - [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Security](#security)
- [File Upload — Cloudinary](#file-upload--cloudinary)
- [Email](#email)
- [Background Jobs](#background-jobs)
- [Error Handling](#error-handling)
- [Logging](#logging)
- [Scripts](#scripts)

---

## Features

| Category | Details |
|---|---|
| **Auth** | Register, login (brute-force protection), refresh tokens, email verification, forgot/reset password, change password, logout |
| **RBAC** | 3 roles (admin, manager, staff) × 14 resources × 5 actions, enforced on every route |
| **Products** | Full CRUD with Cloudinary image upload, SKU, category/supplier relations |
| **Inventory** | Stock tracking per warehouse, adjustment history, low-stock alerts |
| **Purchases** | Purchase orders with line items, supplier-linked, status workflow |
| **Sales** | Sales orders with line items, customer-linked, return workflow |
| **Customers** | CRM with purchase history, credit limit tracking |
| **Suppliers** | Supplier management with contact and address details |
| **Expenses** | Create, approve/reject workflow, receipt upload to Cloudinary, summary reports |
| **Payments** | Stripe payment intent creation, charge, refund, webhook handling |
| **File Uploads** | All files stored on **Cloudinary** (no local disk usage), separate folders per feature |
| **Reports** | Dashboard stats, P&L with expense deductions, inventory valuation, sales/purchase reports |
| **Audit Log** | Immutable trail of user actions (login, logout, extensible to any event) |
| **Security** | Helmet, CORS, rate limiting, HPP, NoSQL injection sanitization, raw body for Stripe |
| **Background Jobs** | Daily low-stock email alerts, monthly auto-report generation (node-cron) |
| **Email** | SMTP via Nodemailer — email verification, password reset, low-stock notifications |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express v5 |
| Language | TypeScript v5 |
| Database | MongoDB via Mongoose v9 |
| Validation | Zod v4 |
| Auth | JSON Web Tokens (jsonwebtoken) + bcrypt |
| File Storage | **Cloudinary** (via multer-storage-cloudinary) |
| Payments | Stripe |
| Email | Nodemailer (SMTP) |
| Logging | Winston + Morgan |
| Background Jobs | node-cron |
| Security | helmet, cors, express-rate-limit, express-mongo-sanitize, hpp |

---

## Architecture

```
src/
├── app.ts                  # Express app setup (middleware stack)
├── server.ts               # HTTP server entry point
├── config/
│   └── index.ts            # Centralised config from env vars
├── core/
│   ├── upload.ts           # Cloudinary multer storage (general, receipts, products, avatars)
│   ├── permissions.ts      # RBAC matrix (role → resource → actions)
│   ├── errors.ts           # Typed HTTP error classes
│   ├── apiResponse.ts      # Unified JSON response helper
│   ├── catchAsync.ts       # Async error wrapper
│   ├── database.ts         # Mongoose connection
│   ├── email.ts            # Nodemailer email service
│   └── logger.ts           # Winston logger
├── middlewares/
│   ├── auth.ts             # JWT auth + requirePermission guard
│   ├── validate.ts         # Zod validation middleware
│   ├── globalErrorHandler.ts
│   ├── notFound.ts
│   └── requestLogger.ts
├── jobs/
│   └── index.ts            # Cron job definitions
├── routes/
│   └── index.ts            # Central route registry
└── modules/                # Feature modules (each has model/validation/service/controller/route)
    ├── user/
    ├── category/
    ├── supplier/
    ├── product/
    ├── inventory/
    ├── purchase/
    ├── sale/
    ├── customer/
    ├── expense/
    ├── payment/
    ├── upload/
    ├── report/
    └── audit/
```

---

## Project Structure

Each feature module follows the same internal layout:

```
modules/<feature>/
├── <feature>.model.ts       # Mongoose schema + TypeScript interface
├── <feature>.validation.ts  # Zod schemas for request validation
├── <feature>.service.ts     # Business logic
├── <feature>.controller.ts  # HTTP I/O (calls service, sends response)
└── <feature>.route.ts       # Express router with middleware chain
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB instance (local or Atlas)
- Cloudinary account (free tier works)
- Stripe account (for payment features)
- SMTP credentials (Gmail App Password or similar)

### Installation

```bash
git clone https://github.com/mdnuruzzamannirob/ims-backend.git
cd ims-backend
npm install
```

### Environment Variables

Copy the template and fill in your values:

```bash
cp .env.example .env
```

Full `.env` reference:

```env
# Server
NODE_ENV=development          # development | production
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ims

# JWT
JWT_SECRET=change-me-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change-me-too
JWT_REFRESH_EXPIRES_IN=30d
JWT_PASSWORD_RESET_EXPIRES_IN=10m

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=you@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=IMS System <you@gmail.com>

# File Uploads
UPLOAD_MAX_FILE_SIZE=5242880         # 5 MB in bytes
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp,application/pdf

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYMENT_CURRENCY=usd

# Logging
LOG_LEVEL=info                # error | warn | info | debug
```

### Running the Server

```bash
# Development (hot-reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint
npm run lint
```

---

## API Reference

Base URL: `http://localhost:5000/api/v1`

> All protected routes require the `Authorization: Bearer <access_token>` header.

---

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | — | Register a new user |
| `POST` | `/auth/login` | — | Login (returns access + refresh tokens) |
| `POST` | `/auth/refresh-token` | — | Rotate access token using refresh token |
| `GET` | `/auth/verify-email/:token` | — | Verify email address |
| `POST` | `/auth/forgot-password` | — | Request password reset email |
| `POST` | `/auth/reset-password/:token` | — | Reset password with token |
| `POST` | `/auth/logout` | ✅ | Logout (invalidates refresh token) |
| `GET` | `/auth/profile` | ✅ | Get own profile |
| `PATCH` | `/auth/profile` | ✅ | Update profile (supports `avatar` file upload) |
| `POST` | `/auth/change-password` | ✅ | Change password |

**Register body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Login body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Login response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "_id": "...", "name": "...", "email": "...", "role": "admin" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### Users (Admin)

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| `GET` | `/auth/users` | `user:read` | List all users (paginated) |
| `GET` | `/auth/users/:id` | `user:read` | Get user by ID |
| `PATCH` | `/auth/users/:id` | `user:update` | Update user role/status |
| `DELETE` | `/auth/users/:id` | `user:delete` | Delete user |

---

### Categories

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| `POST` | `/categories` | `category:create` | Create category |
| `GET` | `/categories` | `category:read` | List categories |
| `GET` | `/categories/:id` | `category:read` | Get category |
| `PATCH` | `/categories/:id` | `category:update` | Update category |
| `DELETE` | `/categories/:id` | `category:delete` | Delete category |

---

### Suppliers

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| `POST` | `/suppliers` | `supplier:create` | Create supplier |
| `GET` | `/suppliers` | `supplier:read` | List suppliers |
| `GET` | `/suppliers/:id` | `supplier:read` | Get supplier |
| `PATCH` | `/suppliers/:id` | `supplier:update` | Update supplier |
| `DELETE` | `/suppliers/:id` | `supplier:delete` | Delete supplier |

---

### Products

Supports optional `image` file field (multipart/form-data). Image is stored in Cloudinary under `ims/products/`.

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| `POST` | `/products` | `product:create` | Create product (optional `image` upload) |
| `GET` | `/products` | `product:read` | List products (filter by category, supplier, search) |
| `GET` | `/products/:id` | `product:read` | Get product |
| `PATCH` | `/products/:id` | `product:update` | Update product (optional `image` upload) |
| `DELETE` | `/products/:id` | `product:delete` | Delete product |

**Create product body (multipart/form-data):**
```
name        = "Laptop Stand"
sku         = "STAND-001"
category    = <ObjectId>
supplier    = <ObjectId>
buyPrice    = 1500
sellPrice   = 2000
unit        = "pcs"
reorderLevel= 5
image       = <file>      ← optional
```

---

### Inventory

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| `GET` | `/inventory` | `inventory:read` | List inventory (with low-stock filter) |
| `GET` | `/inventory/:id` | `inventory:read` | Get inventory item |
| `POST` | `/inventory/adjust` | `inventory:update` | Manual stock adjustment |

---

### Purchases

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| `POST` | `/purchases` | `purchase:create` | Create purchase order |
| `GET` | `/purchases` | `purchase:read` | List purchases |
| `GET` | `/purchases/:id` | `purchase:read` | Get purchase |
| `PATCH` | `/purchases/:id` | `purchase:update` | Update purchase status |

---

### Sales

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| `POST` | `/sales` | `sale:create` | Create sale |
| `GET` | `/sales` | `sale:read` | List sales |
| `GET` | `/sales/:id` | `sale:read` | Get sale |
| `PATCH` | `/sales/:id/return` | `sale:update` | Process return |

---

### Customers

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| `POST` | `/customers` | `customer:create` | Create customer |
| `GET` | `/customers` | `customer:read` | List customers |
| `GET` | `/customers/:id` | `customer:read` | Get customer with purchase history |
| `PATCH` | `/customers/:id` | `customer:update` | Update customer |
| `DELETE` | `/customers/:id` | `customer:delete` | Delete customer |

---

### Expenses

Supports optional `receipt` file field (multipart/form-data). Receipt stored in Cloudinary under `ims/receipts/`.

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| `POST` | `/expenses` | `expense:create` | Create expense (optional `receipt` upload) |
| `GET` | `/expenses` | `expense:read` | List expenses (filter by category, status, date) |
| `GET` | `/expenses/summary` | `expense:read` | Aggregated summary (by category, status, monthly) |
| `GET` | `/expenses/:id` | `expense:read` | Get expense |
| `PATCH` | `/expenses/:id` | `expense:update` | Update expense (owner of pending only) |
| `PATCH` | `/expenses/:id/approve` | `expense:manage` | Approve expense |
| `PATCH` | `/expenses/:id/reject` | `expense:manage` | Reject expense with reason |
| `DELETE` | `/expenses/:id` | `expense:delete` | Delete expense (not approved) |

**Expense categories:** `rent`, `utilities`, `salary`, `maintenance`, `marketing`, `transport`, `office_supplies`, `taxes`, `other`

**Reject body:**
```json
{ "reason": "Duplicate submission" }
```

---

### Payments (Stripe)

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| `POST` | `/payments/intent` | `payment:create` | Create Stripe PaymentIntent |
| `POST` | `/payments/charge` | `payment:create` | Record a charge |
| `POST` | `/payments/:id/refund` | `payment:manage` | Refund a payment |
| `GET` | `/payments` | `payment:read` | List payments |
| `GET` | `/payments/:id` | `payment:read` | Get payment |
| `POST` | `/payments/stripe/webhook` | — | Stripe webhook (raw body, no auth) |

---

### File Uploads (Cloudinary)

> All uploads go directly to Cloudinary. No files are stored locally.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/uploads/single` | ✅ | Upload one file (`file` field) |
| `POST` | `/uploads/multiple` | ✅ | Upload up to 10 files (`files` field) |
| `GET` | `/uploads/:id` | ✅ | Get file metadata |
| `GET` | `/uploads/relation/:model/:modelId` | ✅ | Get all files for a related entity |
| `DELETE` | `/uploads/:id` | ✅ | Delete file (from Cloudinary + database) |

**Cloudinary folder structure:**
```
ims/
├── general/    ← /uploads endpoint
├── products/   ← product image upload
├── receipts/   ← expense receipt upload
└── avatars/    ← profile avatar upload
```

**Single upload response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "originalName": "invoice.pdf",
    "fileName": "ims/receipts/abc123",
    "mimeType": "application/pdf",
    "size": 204800,
    "secureUrl": "https://res.cloudinary.com/your-cloud/image/upload/ims/receipts/abc123.pdf",
    "url": "https://res.cloudinary.com/..."
  }
}
```

---

### Reports & Dashboard

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| `GET` | `/reports/dashboard` | `report:read` | Live dashboard stats (today/month sales, low stock, recent activity) |
| `GET` | `/reports/profit-loss` | `report:read` | P&L with gross profit, total expenses, net profit |
| `GET` | `/reports/inventory-valuation` | `report:read` | Stock value per product |
| `GET` | `/reports/sales` | `report:read` | Sales report with top customers |
| `GET` | `/reports/purchases` | `report:read` | Purchase report with top suppliers |

All report endpoints accept optional `startDate` and `endDate` query parameters.

**P&L response includes:**
```json
{
  "totalRevenue": 500000,
  "totalCOGS": 300000,
  "grossProfit": 200000,
  "grossProfitMargin": 40,
  "totalExpenses": 50000,
  "netProfit": 150000,
  "netProfitMargin": 30
}
```

---

### Audit Logs

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| `GET` | `/audit-logs` | `audit:read` | List audit logs (filter by userId, action, resource, date) |

**Query parameters:** `userId`, `action`, `resource`, `startDate`, `endDate`, `page`, `limit`

---

## Authentication & Authorization

### JWT Tokens

| Token | Expiry | Usage |
|---|---|---|
| **Access Token** | 15 minutes | `Authorization: Bearer <token>` header on every protected request |
| **Refresh Token** | 30 days | `POST /auth/refresh-token` body to get a new access token |

Account locking: after **5 consecutive failed login attempts**, the account is locked for **15 minutes**.

---

### Role-Based Access Control (RBAC)

Three roles with granular per-resource permissions:

| Role | Description |
|---|---|
| `admin` | Full access to all resources and actions |
| `manager` | Full CRUD on business data, cannot delete users or manage system settings |
| `staff` | Read-only + create on operational resources (sales, purchases, expenses) |

**Permission matrix excerpt:**

| Resource | Admin | Manager | Staff |
|---|---|---|---|
| user | all | read, update | read |
| product | all | all | read |
| inventory | all | read, update | read |
| purchase | all | all | create, read |
| sale | all | all | create, read |
| expense | all | create, read, update, manage | create, read |
| audit | read, manage | read | — |
| report | all | read | — |

---

## Security

| Measure | Implementation |
|---|---|
| Security headers | `helmet()` |
| CORS | Restricted to `FRONTEND_URL` in production |
| Rate limiting | 20 req/15 min on `/auth/login`, `/register`, `/forgot-password` |
| NoSQL injection | `express-mongo-sanitize()` strips `$` and `.` from request bodies |
| HTTP Parameter Pollution | `hpp()` |
| Response compression | `compression()` |
| Password hashing | bcrypt with salt rounds 12 |
| Stripe raw body | Captured in `express.json({ verify })` for signature verification |
| Input validation | All inputs validated with Zod schemas before reaching the service layer |

---

## File Upload — Cloudinary

All file uploads go directly to your **Cloudinary** account. No files are written to disk.

**How it works:**
1. `multer-storage-cloudinary` intercepts the multipart request
2. File is streamed directly to Cloudinary
3. Cloudinary returns `secure_url` (HTTPS CDN URL) and `public_id`
4. The URL and public_id are saved to MongoDB (`FileUpload` collection)
5. When a file is deleted, it is also removed from Cloudinary via the API

**Images are auto-optimised** with `quality: auto` and `fetch_format: auto` (WebP/AVIF when supported).

---

## Email

Emails are sent via **Nodemailer** using SMTP (configured for Gmail by default).

| Trigger | Email |
|---|---|
| Registration | Email verification link |
| Forgot password | Password reset link (expires in 10 min) |
| Low stock alert | Daily cron job sends list of items below reorder level |

Configure via `EMAIL_*` environment variables.

---

## Background Jobs

Scheduled with **node-cron**:

| Schedule | Job |
|---|---|
| Every day at **08:00** | Check inventory for low-stock items, email admin/managers |
| 1st of every month at **00:05** | Generate monthly summary report |

---

## Error Handling

All errors are caught by `catchAsync` and passed to the global error handler, returning a consistent JSON shape:

```json
{
  "success": false,
  "message": "Human-readable description",
  "errors": [ ... ]   // Zod validation errors (optional)
}
```

| Error Class | HTTP Status |
|---|---|
| `BadRequestError` | 400 |
| `UnauthorizedError` | 401 |
| `ForbiddenError` | 403 |
| `NotFoundError` | 404 |
| `ConflictError` | 409 |

Unhandled errors return `500 Internal Server Error` in production (stack traces hidden).

---

## Logging

| Logger | Usage |
|---|---|
| **Winston** | Application logs: info, warn, error — written to `logs/` in production |
| **Morgan** | HTTP access log per request in development |
| **request logger** | Custom middleware logs method, path, status, duration |

Set `LOG_LEVEL=debug` for verbose output during development.

---

## Scripts

```bash
npm run dev        # Start with ts-node-dev (hot-reload)
npm run build      # Compile TypeScript → dist/
npm start          # Run compiled dist/server.js
npm run lint       # ESLint check on src/
```

---

## License

ISC © [Md. Nuruzzaman](https://github.com/mdnuruzzamannirob)
