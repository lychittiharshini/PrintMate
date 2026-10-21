# PrintMate – Printing Steps Guide

A complete, responsive web application designed for a Xerox and printing shop with centralized shared data persistence and private inventory management.

---

## 🖨️ Customer & Shop Interface

- **Printing Instructions & Tasks**: Public customer-facing interface is centered on clear, numbered printing checklists for daily shop jobs.
- **Dynamic Categories**:
  - Filter guides by **All Guides**, **WhatsApp**, **Cards & IDs**, **Xerox**, **Colour Print**, **Email & PDF**, or any custom printing categories added by the administrator.
- **Service Cards on Hero**:
  - Quick-jump cards for **WhatsApp Printing**, **Xerox**, and **PDF & Photos**.
- **Interactive Checklists**:
  - Clickable numbered steps with green checkmarks.
  - Optional step descriptions and technical tips.
  - Preserves completed step marks per machine with **DONE** and **CLEAR ALL** reset workflows.
- **Private Stationery by Default**: Stationery products remain private to the admin and do not appear on the public homepage unless explicitly published.

---

## 🌐 Central Shared Database & Cross-Device Synchronization

- **Single Source of Truth**:
  - The application uses a central, shared backend database (`/api/data` backed by persistent server storage in `data/printmate_db.json`).
  - Changes made by the administrator (adding tasks, editing instructions, deleting categories) are stored centrally and immediately reflect across all devices (shop computer, phone, laptop, customer view).
- **Deletion Safety**:
  - When an item or task is deleted by the admin, it is permanently deleted from the database. Deleted items are never revived or restored from hardcoded seed data.
- **Live Background Polling**:
  - Background synchronization keeps open browser sessions updated every 6 seconds and immediately whenever the browser tab regains focus.
- **Instant Optimistic UI**:
  - Actions take effect immediately on screen while syncing to the server in the background.

---

## 🔒 Admin Dashboard & Private Management

- **Admin Login**:
  - **Username**: `harshini`
  - **Password**: `harshini8019`
- **Printing Tasks & Guides**:
  - Add new printing tasks with custom titles, dynamic category assignment, optional task descriptions, and numbered steps.
  - Edit existing tasks and descriptions.
  - Reorder tasks with Up / Down controls.
  - Delete tasks permanently with confirmation.
  - Add, edit, delete, and reorder individual numbered steps.
  - Optional step descriptions/tips.
- **Printing Categories Management**:
  - Add new printing categories with pastel accents and descriptions.
  - Edit printing category names (automatically updates all assigned guides).
  - Delete categories with confirmation and safe guide reassignment.
- **Private Product Inventory**:
  - Products are **Private by default** (`visibility: 'private'`).
  - Preview private inventory within the dashboard with `🔒 Private` and `🌐 Published` status indicators.
  - One-click **Publish** and **Unpublish** controls.
  - Manage prices, sale prices, stock status, descriptions, and compressed image uploads.
- **Stationery Categories**:
  - Full CRUD management for shop supply categories.
