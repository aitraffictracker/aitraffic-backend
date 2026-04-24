# AI Traffic Backend

Backend API and PostgreSQL storage for the [AI Traffic Tracker](https://github.com/aitraffictracker/aitraffictracker) script.

Receives tracking data from the privacy‑first client‑side script, normalises AI sources, and stores events.

**Status:** Alpha – API is functional, dashboard coming soon.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Docker)

### 1. Clone and install

```git clone https://github.com/aitraffictracker/aitraffic-backend.git
cd aitraffic-backend
npm install
```

### 2. Set up the database
Create a PostgreSQL database and run the schema:

```psql -U your_user -d your_db < schema.sql```

### 3. Configure environment

Copy .env.example to .env and set your DATABASE_URL.

### 4. Start the server
```npm start```

The API will be available at http://localhost:3000/track

### 🐳 Docker (self‑hosted full stack)
```docker compose up -d```

This starts both the API and a PostgreSQL instance. The API will be reachable on port 3000.

### 🔌 API Endpoints
### POST /track

Accepts JSON:

```json
{
  "siteId": "myblog",
  "source": "chatgpt",
  "page": "/blog/hello",
  "referrer": "https://chat.openai.com/..."
}
```

Returns 202 on success. Source names are normalised (e.g. chatgpt.com → ChatGPT).

### GET /health
Returns 200 OK.

### 🛡️ Privacy
No IP addresses, no cookies, no personal data stored. See the main tracker for details.

### 📄 License
AGPL‑3.0 – see LICENSE file. You may self‑host freely; if you modify and offer this as a service, you must make your changes public.
