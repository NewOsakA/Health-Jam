# Health-Jam

_A hospital management web application (TGWK12 – Web Development Fundamentals, Autumn 2025)_

## Overview

Health Jam is a full‑stack hospital management system built with **Node.js**, **Express**, **Handlebars**, and **SQLite3**. It streamlines how a clinic tracks patients, manages doctors, and schedules appointments while staying responsive on desktop, tablet, and mobile.

The project was developed as the final individual assignment for **TGWK12 – Web Development Fundamentals** at **Jönköping University** by Achirawich Phongpanich ([NewOsakA](https://github.com/NewOsakA)).

---

## Key Features

- **Patients module** – Create, edit, delete, and paginate through patient records with quick condition notes.
- **Doctors module** – Maintain a specialist directory and update credentials on the fly.
- **Appointments module** – Link patients and doctors via SQL joins, view schedules.
- **Accounts & authentication** – BCrypt‑hashed credentials, role management (admin vs. staff), and protected routes.
- **Responsive UI/UX** – Flexbox/Grid layout with a mobile nav drawer and consistent styling across devices.

---

## Getting Started

### Prerequisites

- Node.js 18+ (tested on macOS Sonoma)
- npm (bundled with Node)

### Installation

```bash
# Clone the repository
git clone https://github.com/NewOsakA/Health-Jam.git
cd Health-Jam

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

## Project Structure

```
Health-Jam/
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


## Engineering Notes

The application uses Express route modules for each domain, Handlebars for server-rendered pages, and SQLite for relational data and session storage. Login uses bcrypt password verification, while middleware separates authenticated access from administrator actions.

- [Application and session configuration](server.js)
- [Feature routes](routes)
- [Access-control middleware](middleware)
- [Database setup](database.js)

## Scope and Attribution

This is an educational application for local development. The seeded accounts are for that environment; the project is not presented as a production hospital system.

Achirawich Phongpanich developed the individual coursework project, covering patient, doctor, appointment, account, and interface workflows. Some code was generated with help from ChatGPT and Gemini, as acknowledged in the source.

The `npm test` script is currently a placeholder; no automated test coverage is claimed. To inspect the main flows locally, start the application, sign in with the seeded administrator, and check patient and doctor management, appointment creation, and account permissions.
