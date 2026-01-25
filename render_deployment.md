# Deploying to Render.com

Since we have a `render.yaml` file, deployment is automated using **Blueprints**.

## Steps to Deploy

### 1. Push Code to GitHub
Render needs your code in a GitHub repository.
1.  Initialize git (if not done): `git init`
2.  Add files: `git add .`
3.  Commit: `git commit -m "Ready for Render"`
4.  Create a repo on GitHub and push.

### 2. Create New Blueprint on Render
1.  Go to [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints).
2.  Click **New Blueprint Instance**.
3.  Connect your GitHub repository.
4.  Render will detect `render.yaml`. Click **Apply**.

### 3. Configure Database
*   **PostgreSQL**: Render will automatically create the Postgres database defined in the YAML.
*   **MongoDB**: Render does *not* host MongoDB. You need a **MongoDB Atlas** connection string.
    *   In the Render Dashboard, go to the created **Backend Service**.
    *   Click **Environment**.
    *   Add `MONGO_URI` with your connection string (e.g., `mongodb+srv://user:pass@cluster...`).

### 4. Initialize PostGIS on Render
Once the Postgres DB is created:
1.  Go to the **Dashboard** -> **Postgres** (smart-city-db) -> **Connect**.
2.  Copy the **External Connection String** (or use the internal shell).
3.  You need to run the SQL to enable PostGIS and create tables.
    *   **Option A (Shell)**: Use the "Shell" tab in the database dashboard to run:
        ```sql
        CREATE EXTENSION postgis;
        -- Paste content of backend/sql/init_postgis.sql here --
        ```
    *   **Option B (Local Connection)**: Connect from your local PC using the external string and run the script.

### 5. Done!
Your frontend will be live at `https://smart-city-frontend.onrender.com`.
