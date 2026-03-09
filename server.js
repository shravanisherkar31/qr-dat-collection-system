const express    = require("express");
const cors       = require("cors");
const path       = require("path");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── MongoDB Connection ──
// ── MongoDB Connection ──
// ── MongoDB Connection ──
const MONGO_URI = "mongodb://shravanis_db:9011878255@ac-mkxm4c4-shard-00-00.rtq6qpq.mongodb.net:27017,ac-mkxm4c4-shard-00-01.rtq6qpq.mongodb.net:27017,ac-mkxm4c4-shard-00-02.rtq6qpq.mongodb.net:27017/qrdatacollection?ssl=true&replicaSet=atlas-hrupio-shard-0&authSource=admin";

const DB_NAME = "qrdatacollection";
let db;

async function connectDB() {
  try {
    const client = await MongoClient.connect(MONGO_URI);
    db = client.db(DB_NAME);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.log("⚠️ MongoDB not available, using memory storage");
    console.log(err);
    db = null;
  }
}

// In-memory fallback
let memUsers = [];
let memConfig = {
  eventName:  "Tech Fest 2024",
  eventDate:  "15 December 2024",
  eventVenue: "Main Auditorium",
  eventDesc:  "Annual technology festival for students",
  fields: [
    { id: "name",    label: "Full Name",     type: "text",  placeholder: "e.g. Rahul Sharma", required: true },
    { id: "email",   label: "Email Address", type: "email", placeholder: "you@example.com",   required: true },
    { id: "phone",   label: "Phone Number",  type: "text",  placeholder: "9876543210",         required: true },
    { id: "college", label: "College Name",  type: "text",  placeholder: "Your college name",  required: true },
    { id: "course",  label: "Course",        type: "text",  placeholder: "e.g. B.Tech CS",     required: true },
    { id: "year",    label: "Year",          type: "text",  placeholder: "FY / SY / TY",       required: true }
  ]
};

// ── Helper: Get Config ──
async function getConfig() {
  if (db) {
    const cfg = await db.collection("config").findOne({ _id: "main" });
    return cfg || memConfig;
  }
  return memConfig;
}

// ── Pages ──
app.get("/",         (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/about",    (req, res) => res.sendFile(path.join(__dirname, "public", "about.html")));
app.get("/contact", (req, res) => res.sendFile(path.join(__dirname, "public", "contact.html")));
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "public", "register.html")));
app.get("/login",    (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/admin",    (req, res) => res.sendFile(path.join(__dirname, "public", "admin.html")));
app.get("/test", (req, res) => {
  res.send("TEST WORKING");
});
// ── Auth ──
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    res.json({ success: true, token: "admin-token-2024" });
  } else {
    res.status(401).json({ success: false, message: "Invalid username or password." });
  }
});

// ── Get Config (public) ──
app.get("/api/config", async (req, res) => {
  res.json(await getConfig());
});

// ── Save Config (protected) ──
app.post("/api/config", async (req, res) => {
  if (req.headers["authorization"] !== "Bearer admin-token-2024")
    return res.status(401).json({ message: "Unauthorized" });

  const newConfig = { ...memConfig, ...req.body, _id: "main" };
  if (db) {
    await db.collection("config").replaceOne({ _id: "main" }, newConfig, { upsert: true });
  } else {
    memConfig = newConfig;
  }
  console.log("Config updated:", newConfig.eventName);
  res.json({ success: true, config: newConfig });
});

// ── Register ──
app.post("/register", async (req, res) => {
  const config = await getConfig();
  const entry  = {
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    createdAt: new Date()
  };
  config.fields.forEach(f => { entry[f.id] = req.body[f.id] || ""; });

  if (db) {
    await db.collection("registrations").insertOne(entry);
  } else {
    entry.id = Date.now();
    memUsers.push(entry);
  }
  console.log("New registration:", entry.name || "—");
  res.json({ success: true, message: "Registered successfully!" });
});

// ── Get Users (protected) ──
app.get("/users", async (req, res) => {
  if (req.headers["authorization"] !== "Bearer admin-token-2024")
    return res.status(401).json({ message: "Unauthorized" });

  const config = await getConfig();
  let users;
  if (db) {
    users = await db.collection("registrations").find({}).sort({ createdAt: -1 }).toArray();
    users = users.map(u => ({ ...u, id: u._id.toString() }));
  } else {
    users = memUsers;
  }
  res.json({ users, fields: config.fields });
});

// ── Delete User (protected) ──
app.delete("/users/:id", async (req, res) => {
  if (req.headers["authorization"] !== "Bearer admin-token-2024")
    return res.status(401).json({ message: "Unauthorized" });

  if (db) {
    try { await db.collection("registrations").deleteOne({ _id: new ObjectId(req.params.id) }); }
    catch (e) { await db.collection("registrations").deleteOne({ _id: req.params.id }); }
  } else {
    memUsers = memUsers.filter(u => String(u.id) !== req.params.id);
  }
  res.json({ success: true });
});

// ── Start Server ──
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
}); 

