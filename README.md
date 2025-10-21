# 🩺 Health Jam

_A hospital management web application (TGWK12 – Web Development Fundamentals, Autumn 2025)_

> “Professional care, simplified scheduling, and clear records.”

---

## 📖 Overview

Health Jam is a full‑stack hospital management system built with **Node.js**, **Express**, **Handlebars**, and **SQLite3**. It streamlines how a clinic tracks patients, manages doctors, and schedules appointments while staying responsive on desktop, tablet, and mobile.

The project was developed as the final individual assignment for **TGWK12 – Web Development Fundamentals** at **Jönköping University** with the goal of meeting the full **Grade 5** requirements (see rubric in `tgwk12-grading-criteria-project-v1.2.pdf`).

---

## ✨ Key Features

- **Patients module** – Create, edit, delete, and paginate through patient records with quick condition notes.
- **Doctors module** – Maintain a specialist directory and update credentials on the fly.
- **Appointments module** – Link patients and doctors via SQL joins, view schedules.
- **Accounts & authentication** – BCrypt‑hashed credentials, role management (admin vs. staff), and protected routes.
- **Responsive UI/UX** – Flexbox/Grid layout with a mobile nav drawer and consistent styling across devices.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (tested on macOS Sonoma)
- npm (bundled with Node)

### Installation

```bash
# Clone the repository
 git clone <repo-url>
 cd HealthHub

# Install dependencies
 npm install

# Start the dev server with hot reload (nodemon)
 npm run dev
```

The server runs on [http://localhost:3000](http://localhost:3000).

### Seed Data

The repository ships with `clinic.db` preloaded with:

- 15 patients
- 5 doctors
- 12 appointments
- 5 user accounts (including the seeded admin listed below)

### Default Credentials

- **Admin**: `admin` / `wdf#2025`
- Create additional users from the **Accounts** page once logged in as admin.

---

## 🗂 Project Structure

```
HealthHub/
├── publics/               # Static assets & CSS, JS
├── routes/                # Express route modules (main, patients, doctors, appointments, accounts)
├── views/                 # Handlebars layouts, pages, and partials
│   ├── layouts/
│   ├── partials/
│   └── ...
├── middleware/            # requireLogin / requireAdmin guards
├── database.js            # SQLite admin seeding
├── clinic.db              # SQLite database (prepopulated)
├── server.js              # Express
└── package.json
```
