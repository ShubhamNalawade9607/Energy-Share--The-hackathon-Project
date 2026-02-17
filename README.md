# ⚡ EV Charging Platform - Hackathon Edition

A full-stack MVP for discovering and booking EV charging stations with green score tracking.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

### Installation

```bash
cd "project 101"
npm install
```

### Environment Setup
Update `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ev-charging
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### Run the Server
```bash
npm start          # Production
npm run dev        # Development with auto-reload
```

Visit: **http://localhost:5000**

---

## 📁 Project Structure

```
project 101/
├── public/                 # Frontend (HTML/CSS/JS)
│   ├── index.html         # User dashboard
│   ├── owner-dashboard.html
│   ├── css/style.css
│   └── js/
│       ├── api.js         # API wrapper
│       ├── auth.js        # Auth flow
│       ├── main.js        # Map & charger discovery
│       └── owner-dashboard.js
│
├── server/                # Backend (Node/Express)
│   ├── models/            # MongoDB schemas
│   │   ├── User.js
│   │   ├── Charger.js
│   │   └── Booking.js
│   ├── controllers/       # Route handlers
│   ├── routes/            # API endpoints
│   ├── middleware/        # JWT auth
│   └── server.js          # Express entry point
│
├── .env                   # Environment config
├── package.json
└── README.md
```

---

## 🎯 Features

### For Users
- ✅ Register/Login
- ✅ Browse chargers on interactive map (Leaflet + OSM)
- ✅ Book available slots
- ✅ Track green score (points per charging hour)
- ✅ View booking history
- ✅ Leaderboard

### For Charger Owners
- ✅ Register as owner
- ✅ Add multiple charging stations
- ✅ Edit station details
- ✅ View real-time bookings
- ✅ Track availability
- ✅ Delete stations

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User/Owner signup
- `POST /api/auth/login` - Login

### Chargers
- `GET /api/chargers` - All chargers
- `GET /api/chargers/:id` - Charger details
- `POST /api/chargers` - Create (owner only)
- `PUT /api/chargers/:id` - Update (owner only)
- `DELETE /api/chargers/:id` - Delete (owner only)
- `GET /api/chargers/owner/list` - My chargers

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/user/list` - My bookings
- `PUT /api/bookings/:id/complete` - Mark complete
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Users
- `GET /api/users/profile` - Current profile
- `GET /api/users/leaderboard` - Top 10 users

---

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3, Bootstrap 5
- Vanilla JavaScript
- Leaflet.js + OpenStreetMap

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt (password hashing)

---

## 🧪 Testing

### Sample Data (Manual)

1. **Register User**
   - Name: John Doe
   - Email: user@test.com
   - Password: test123
   - Role: User

2. **Register Owner**
   - Name: Jane Smith
   - Email: owner@test.com
   - Password: test123
   - Role: Owner

3. **Add Charger (as owner)**
   - Name: Downtown Station
   - Address: 123 Main St
   - Latitude: 51.5074
   - Longitude: -0.1278
   - Type: Level 2
   - Slots: 4

4. **Book Charger (as user)**
   - Find charger on map
   - Click "Book Now"
   - Enter duration
   - Get green points

---

## 🎨 UI Screenshots

- **User Dashboard**: Map with chargers, sidebar with list & leaderboard
- **Owner Dashboard**: Add/edit chargers, view bookings & stats
- **Auth Modal**: Login/Register tabs

---

## ⚠️ MVP Limitations

- No payment gateway
- No email verification
- No real-time socket.io updates
- Simple slot management (no time-based conflicts)
- Mock green score (10 pts/hour)

---

## 🚀 Next Steps (Post-Hackathon)

- [ ] Email verification
- [ ] Real-time booking conflicts
- [ ] Payment integration
- [ ] User reviews/ratings
- [ ] Search filters
- [ ] Mobile app (React Native)
- [ ] Admin dashboard

---

## 📝 License

MIT - Hackathon Edition

---

**Built with ❤️ for the Hackathon**
