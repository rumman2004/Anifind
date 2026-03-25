# AniFind 🎌

A modern anime discovery platform built with React and Node.js, powered by the Jikan API (MyAnimeList). Browse seasonal anime, explore detailed information, watch trailers, and manage your personal favorites list.

![AniFind Banner](https://res.cloudinary.com/ddil24vfs/image/upload/v1772903287/Screenshot_2026-03-07_223700_rkjydf.png?text=AniFind+🎌)

## ✨ Features

- 🔍 **Search & Discovery** — Search any anime by name with real-time results
- 🎬 **Hero Section** — Auto-rotating showcase of top seasonal anime with trailers
- 📺 **Anime Detail Pages** — Full info including synopsis, characters, related anime, studios, and streaming links
- 🎥 **Trailer Playback** — Watch official YouTube trailers in an elegant modal
- ❤️ **Favorites System** — Save and manage your personal anime list (requires account)
- 👤 **Auth System** — Register and log in with JWT-based authentication
- 📱 **Fully Responsive** — Optimized for mobile, tablet, and desktop
- 🌙 **Dark Theme** — Sleek dark UI designed for anime fans
- ⚡ **Fast & Smooth** — Framer Motion animations throughout

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| Framer Motion | Animations & transitions |
| Tailwind CSS | Utility-first styling |
| Axios | HTTP client |
| Lucide React | Icon library |

### Backend
| Tech | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| express-rate-limit | API rate limiting |

### External APIs
| API | Purpose |
|---|---|
| [Jikan API v4](https://jikan.moe/) | Anime data (MyAnimeList) |
| YouTube (via Jikan) | Trailer embeds |

---

## 📁 Project Structure
?text=AniFind+🎌)

## ✨ Features

- 🔍 **Search & Discovery** — Search any anime by name with real-time results
- 🎬 **Hero Section** — Auto-rotating showcase of top seasonal anime with trailers
- 📺 **Anime Detail Pages** — Full info including synopsis, characters, related anime, studios, and streaming links
- 🎥 **Trailer Playback** — Watch official YouTube trailers in an elegant modal
- ❤️ **Favorites System** — Save and manage your personal anime list (requires account)
- 👤 **Auth System** — Register and log in with JWT-based authentication
- 📱 **Fully Responsive** — Optimized for mobile, tablet, and desktop
- 🌙 **Dark Theme** — Sleek dark UI designed for anime fans
- ⚡ **Fast & Smooth** — Framer Motion animations throughout

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| Framer Motion | Animations & transitions |
| Tailwind CSS | Utility-first styling |
| Axios | HTTP client |
| Lucide React | Icon library |

### Backend
| Tech | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| express-rate-limit | API rate limiting |

### External APIs
| API | Purpose |
|---|---|
| [Jikan API v4](https://jikan.moe/) | Anime data (MyAnimeList) |
| YouTube (via Jikan) | Trailer embeds |

---

## 📁 Project Structure
## 📂 Project Structure

```text
AniFind/
├── frontend/                   # React + Vite app
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── anime/          # Anime-specific components
│   │   │   │   ├── TrailerModal.jsx
│   │   │   │   ├── AudioBadge.jsx
│   │   │   │   └── EpisodeInfo.jsx
│   │   │   ├── section/        # Page sections
│   │   │   │   └── HeroSection.jsx
│   │   │   └── ui/             # Reusable UI components
│   │   │       ├── Badge.jsx
│   │   │       └── Button.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── FavoritesContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── AnimeDetail.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Favorites.jsx
│   │   ├── services/
│   │   │   ├── api.js          # Axios instances
│   │   │   └── animeService.js # Jikan API calls
│   │   └── utils/
│   │       ├── constants.js
│   │       └── helpers.js
│   ├── .env.local              # Local env (git ignored)
│   ├── .env.production         # Production env (git ignored)
│   └── vite.config.js
│
├── server/                     # Express backend
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── favoritesController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── User.js
│   │   └── Favorite.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── favoritesRoutes.js
│   ├── .env                    # Server env (git ignored)
│   └── index.js                # Entry point
│
└── README.md
```

---
## 🚀 Getting Started

### Prerequisites
- Node.js `v18+`
- npm or yarn
- MongoDB Atlas account (free tier works)

---
### 1. Clone the repository

```bash
git clone https://github.com/rumman2004/Anifind.git
cd anifind
```

---

### 2. Set up the Backend

```bash
cd server
npm install
```

Create a `.env` file inside `/server`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/anifind
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

Verify it's running:

```bash
curl http://localhost:5000/api/health
# → {"success":true,"status":"ok","message":"AniFind API is running 🚀"}
```

---

### 3. Set up the Frontend

```bash
cd ../frontend
npm install
```

Create a `.env.local` file inside `/frontend`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open your browser at **http://localhost:5173**

---

## 🌐 Deployment

### Backend → Vercel

1. Push your `server/` folder to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Set the following environment variables in Vercel dashboard:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
CLIENT_URL=https://your-frontend.vercel.app
```

4. Add a `vercel.json` in your `server/` folder:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
```

---

### Frontend → Vercel

1. Push your `frontend/` folder to GitHub
2. Import on Vercel
3. Set environment variable:

```env
VITE_API_URL=https://your-backend.vercel.app/api
```

4. Build settings:
   - **Framework:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Create new account | ❌ |
| POST | `/api/auth/login` | Login and get JWT | ❌ |

### Users
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users/me` | Get current user profile | ✅ |
| PUT | `/api/users/me` | Update profile | ✅ |

### Favorites
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/favorites` | Get user's favorites | ✅ |
| POST | `/api/favorites` | Add anime to favorites | ✅ |
| DELETE | `/api/favorites/:malId` | Remove from favorites | ✅ |

### Health
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/health` | Server health check | ❌ |

---

## 🔐 Environment Variables

### Server (`server/.env`)

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | `mysecretkey123` |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## 🧠 Key Design Decisions

**Jikan rate limiting** — Jikan enforces a limit of 3 requests/second. The app handles this with a built-in 429 retry interceptor and staggered side-loads on the detail page using sequential `await delay(900)` calls.

**Staggered data loading** — On the anime detail page, characters, recommendations, and season data are fetched sequentially with delays to avoid hitting Jikan's rate limit, while the main anime data renders immediately.

**JWT in localStorage** — Auth tokens are stored in `localStorage` under `anifind_user` and automatically attached to every backend request via an Axios request interceptor.

**Trailer fallback chain** — The trailer modal tries `youtube_id` first, then `embed_url`, then parses `url`, and falls back to a thumbnail + external link if nothing embeds.

**Vercel serverless** — The backend uses `if (!process.env.VERCEL)` to conditionally start the HTTP server, allowing the same `index.js` to work both as a local Express server and as a Vercel serverless function.

---

## 🐛 Common Issues

**`ERR_CONNECTION_REFUSED` on localhost:5000**
Your backend is not running. Run `cd server && npm run dev` and check that `NODE_ENV=development` in your `server/.env`.

**CORS error in production**
Make sure `CLIENT_URL` in your Vercel backend environment variables exactly matches your frontend domain including `https://` and no trailing slash.

**Jikan 429 Too Many Requests**
This is normal during heavy browsing. The app retries automatically. If it persists, wait a few seconds and refresh.

**Favorites not saving**
You must be logged in. The JWT token may have expired — log out and log back in.

**Trailer not playing**
Not all anime have trailers on MyAnimeList. If the button is not shown, no trailer data exists for that anime.

---

## 📸 Screenshots


| Home | Anime Detail | Search |
|---|---|---|
| ![Home](https://res.cloudinary.com/ddil24vfs/image/upload/v1772903287/Screenshot_2026-03-07_223700_rkjydf.png?text=Home) | ![Detail](https://res.cloudinary.com/ddil24vfs/image/upload/v1772903656/Screenshot_2026-03-07_224326_c1lwkc.png?text=Detail) | ![Search](https://res.cloudinary.com/ddil24vfs/image/upload/v1772903658/Screenshot_2026-03-07_224349_txjkp2.png?text=Search) |

---

## 🙏 Acknowledgements

- Data provided by the incredible [Jikan API](https://jikan.moe/), the unofficial MyAnimeList API.
- UI inspiration drawn from modern streaming platforms.

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

**Built with ❤️ by [Rumman Ahmed](https://github.com/rumman2004)**
