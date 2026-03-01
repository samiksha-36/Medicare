const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
console.log("GROQ key loaded?", !!process.env.GROQ_API_KEY);

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const prescriptionRoutes = require('./routes/prescriptions');
const aiRoutes = require('./routes/ai');

const app = express();
app.set('trust proxy', 1);  


/* ================= SECURITY ================= */

app.use(helmet());

/* ================= CORS FIX ================= */

const allowedOrigins = [
  process.env.CLIENT_URL, // Production frontend (set in Railway)
  "https://medicare-samiksha.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174"
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / server requests

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight properly

/* ================= RATE LIMIT ================= */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

/* ================= BODY PARSER ================= */

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ================= ROUTES ================= */

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/ai', aiRoutes);

/* ================= HEALTH CHECK ================= */

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

/* ================= 404 ================= */

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

/* ================= GLOBAL ERROR ================= */

app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

/* ================= DATABASE ================= */

mongoose.connect(process.env.MONGODB_URI, {
  family: 4,
})
.then(() => {
  console.log('✅ MongoDB connected');
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
  );
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

module.exports = app;
