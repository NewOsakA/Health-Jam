/*
Achirawich Phongpanich
phac25tg@student.ju.se

Target grade: 5

Project Web Dev Fun 2025

Admininistrator login: admin
Administrator password: "wdf#2025" --> "$2b$12$p5.UuPb9Zh.siIc78Ie.Nu9eGx9d50LT2pkecedig2P.6CdfL1ZUa"

Some code in this project was generated with the help of ChatGPT and Gemini
Several images come from the web (not made by us): Google Images, Unsplash, Pexels, Pixabay.
*/

const path = require("path");
const express = require("express");
const session = require("express-session");
const connectSqlite3 = require("connect-sqlite3");
const { engine } = require("express-handlebars");
const { initDb } = require("./database.js");

const app = express();
const port = process.env.PORT || 3000;

// --- Handlebars
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    partialsDir: path.join(__dirname, "views", "partials"),
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

const Handlebars = require("handlebars");
Handlebars.registerHelper("eq", (a, b) => a === b);
Handlebars.registerHelper("or", (a, b) => a || b);
Handlebars.registerHelper("year", () => new Date().getFullYear());

// helpers
Handlebars.registerHelper("active", (expectedPath, currentPath) =>
  currentPath === expectedPath ? "is-active" : ""
);
Handlebars.registerHelper("activeMatch", (pattern, currentPath) => {
  try {
    return new RegExp(pattern).test(currentPath) ? "is-active" : "";
  } catch {
    return "";
  }
});

// expose path to all views
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

// --- Static (NOTE: your folder is "publics")
app.use(express.static(path.join(__dirname, "publics")));

// --- Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- Sessions (SQLite-backed)
const SQLiteStore = connectSqlite3(session);
app.use(
  session({
    store: new SQLiteStore({
      // Store sessions in project root as session-db.db
      db: "session-db.db",
      dir: __dirname,
    }),
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Expose session to views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// --- Routes
const appRoutes = require("./routes/appRoutes.js");
app.use("/", appRoutes);

// --- DB init
initDb();

// --- Start
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
