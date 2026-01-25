# Smart City GIS / Incident Mapping System

This project is a full-stack MERN + PostgreSQL/PostGIS application designed for tracking and visualizing smart city incidents. It handles spatial data efficiently using PostGIS and provides a reactive frontend with Leaflet.

## 📦 Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Leaflet, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (User/Auth), PostgreSQL + PostGIS (Spatial Data)
- **Deployment**: Render.com

## 🚀 Deployment Guide

### Phase 1: Pre-requisites
1.  **MongoDB Atlas**: Create a free M0 cluster and get your connection string (`mongodb+srv://...`). Whitelist IP `0.0.0.0/0`.
2.  **GitHub**: Push this repository to a new public/private GitHub repo.

### Phase 2: Render Deployment (The Easy Way)
1.  Log in to [Render.com](https://render.com).
2.  Go to "Blueprints" and click "New Blueprint Instance".
3.  Connect your GitHub repository.
4.  Render will detect `render.yaml`.
5.  **IMP:** You will be prompted to enter `MONGODB_URI`. Paste your Atlas connection string.
6.  Click "Apply". Render will automatically:
    - Create a PostgreSQL database (`gis-postgres`).
    - Deploy the Backend Service (`gis-backend`).
    - Deploy the Frontend Service (`gis-frontend`).

### Phase 3: Post-Deployment Setup
1.  **Initialize PostGIS**:
    - Go to your Dashboard -> `gis-postgres` -> "Connect" -> "External Connection".
    - Copy the "PSQL Command".
    - Run it in your local terminal (you need Postgres installed) or use a GUI like PgAdmin.
    - Run the contents of `backend/db/init.sql` to enable PostGIS and create tables.
    ```sql
    CREATE EXTENSION IF NOT EXISTS postgis;
    -- run the rest of init.sql...
    ```
2.  **Verify Frontend**:
    - Visit your frontend URL (e.g., `https://gis-frontend.onrender.com`).
    - You should see the map.
    - Try clicking to add an incident.

## 🛠 Testing Commands

### Backend Local Test
```bash
cd backend
npm install
# Create .env file with local creds
npm run dev
```

### Frontend Local Test
```bash
cd frontend
npm install
# Create .env.local file: VITE_API_URL=http://localhost:5000
npm run dev
```

## ❓ Troubleshooting

### Backend 502 Bad Gateway
- Check logs in Render Dashboard.
- Ensure `start` script is `node server.js`.
- Ensure `PORT` is being used (`process.env.PORT`).

### Frontend 404 on Refresh
- This is a Single Page App (SPA). Ensure `_redirects` file exists in `frontend/public/` with content `/*  /index.html  200`.

### Database Connection Failure
- **MongoDB**: Check Network Access IP whitelist in Atlas (Allow All).
- **Postgres**: Ensure `DATABASE_URL` is correct. Render handles this strictly internally if using Blueprint.

### "PostGIS extension not found"
- You MUST run `CREATE EXTENSION postgis;` in your database. This is not automatic on the free tier unless you run the SQL script manually once.
