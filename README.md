# 🔗 Shortnr: Premium URL Shortener & Link-in-Bio Platform

**Shortnr** is a state-of-the-art SaaS web application for creating, managing, and tracking short links, generating customizable QR codes, and building premium, mobile-optimized Link-in-Bio landing pages. 

---

## 🎨 Premium User Interface

### 1. Modern Landing Page
A sleek, modern header landing experience with subtle grid patterns, glassmorphism UI elements, and a clean call to action.
![Landing Page](screenshots/landing_page.png)

### 2. Analytics Dashboard
The centralized analytics dashboard displays high-density real-time metrics showing total shortened links, clicks tracked, and QR codes generated, giving users immediate feedback.
![Dashboard](screenshots/dashboard.png)

### 3. High-Density Link Management
Instantly create customized short links with optional custom slugs. The management table lets you easily copy shortened URLs, trace target destinations, and track total clicks.
![Link Management](screenshots/link_management.png)

### 4. Customizable QR Code Generator
Downloadable high-resolution QR codes generated dynamically in both **PNG** and **SVG** vector formats, allowing for professional styling and print compatibility.
![QR Code Generator](screenshots/qr_code.png)

### 5. Premium Link-in-Bio Customizer
An interactive profile builder with a live mobile layout preview side-by-side. Customize your display name, upload an avatar, add custom bios, and list your social/portfolio links dynamically.
![Link-in-Bio Customizer](screenshots/link_in_bio.png)

---

## 🛠 Tech Stack & Architecture

### Frontend (React Single Page App)
* **Framework**: React 19, Vite, TypeScript
* **Styling**: Tailwind CSS
* **Routing**: React Router
* **API Client**: Axios

### Backend (Ruby on Rails API)
* **Framework**: Ruby on Rails 8 (API-only mode)
* **Database**: PostgreSQL (Neon Serverless)
* **Caching & Queueing**: Rails 8 Solid Cache & Solid Queue
* **Security & Rate-Limiting**: `Rack::Attack` with password reset throttling
* **Mailer**: Gmail SMTP integration for stateless password recovery

---

## 🚀 Deployed Environments

* **Frontend Hosting**: [Cloudflare Pages](https://shortnr.pages.dev/)
* **Backend API**: [Fly.io Server Instances](https://shortnr-api.fly.dev/)
* **Primary Database**: [Neon PostgreSQL](https://neon.tech/)

---

## 💻 Local Setup & Installation

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Ruby gems:
   ```bash
   bundle install
   ```
3. Set up database credentials in your `.env` file (copy from `.env.example`):
   ```env
   DATABASE_URL="postgresql://user:pass@localhost/db_name"
   FRONTEND_URL="http://localhost:5173"
   GMAIL_USERNAME="your-gmail@gmail.com"
   GMAIL_APP_PASSWORD="your-16-char-app-password"
   ```
4. Setup and run migrations:
   ```bash
   bin/rails db:create db:migrate
   ```
5. Run the test suite:
   ```bash
   bundle exec rspec
   ```
6. Start the local server:
   ```bash
   bin/rails server
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file and set the API connection:
   ```env
   VITE_API_URL="http://localhost:3000/api/v1"
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
