
<div align="center">

  <img src="/frontend/public/favicon.png" alt="GrowVix Logo" width="180"/>

  # GrowVix – AI-Powered Digital Marketing Platform

  **Grow Smarter. Market Better. Achieve More.**

  AI-powered content generation, competitor analysis,
  social media management and marketing analytics.

  ![GitHub](https://img.shields.io/badge/GitHub-Repository-black?logo=github)
  ![React](https://img.shields.io/badge/React-Frontend-blue?logo=react)
  ![Node.js](https://img.shields.io/badge/Node.js-Backend-green?logo=node.js)
  ![MongoDB](https://img.shields.io/badge/MongoDB-Database-darkgreen?logo=mongodb)

</div>

---

## 📸 Project Screenshots

### Dashboard
![GrowVix Dashboard](screenshots/dashboard.png)

### AI Content Generator
![Content Generator](screenshots/content-generator.png)

### Competitor Analysis
![Competitor Analysis](screenshots/competitor-analysis.png)

### AI Marketing Plan
![Marketing Plan](screenshots/marketing-plan.png)

### Social Media Management
![Social Media](screenshots/social-media.png)

### Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)


# 🚀 GrowVix – AI-Powered Digital Marketing Platform

GrowVix is an AI-powered digital marketing and social media management platform designed to help businesses, freelancers, and digital marketing agencies simplify their marketing activities, analyze competitors, generate engaging content, manage social media accounts, and track marketing performance — all from one centralized dashboard.

GrowVix combines Artificial Intelligence, social media integrations, and marketing analytics to make digital marketing smarter, faster, and more effective.

---

## 🌟 Key Features

### 1. 🤖 AI-Powered Content Generation
- Generate engaging social media captions and marketing content using AI.
- Create platform-specific content for different social media channels.
- Generate AI images based on the content and marketing context.
- Customize generated content according to business requirements.
- Edit, save, and manage generated posts.

### 2. 📊 Competitor Analysis
- Add and manage competitor profiles.
- Analyze competitor social media presence.
- Review available engagement and performance metrics.
- Identify competitor strategies and marketing opportunities.
- Generate insights to improve marketing decisions.

### 3. 📅 Social Media Management
- Connect supported social media accounts.
- Manage social media content from one dashboard.
- Create and organize marketing posts.
- Schedule and publish social media content.
- Manage content approval workflows.

### 4. 📈 Marketing Analytics & Insights
- Monitor available social media performance data.
- Track engagement and post performance.
- Analyze likes, comments, shares, and other available metrics.
- View marketing performance through dashboard visualizations.
- Make data-driven marketing decisions.

### 5. 🗓️ AI Marketing Plan
- Generate personalized marketing strategies.
- Create structured 30-day marketing plans.
- Organize content ideas and marketing activities.
- Plan campaigns according to business goals.

### 6. 👥 Role-Based Access Control

GrowVix supports different user roles to manage marketing activities and platform access.

| User Role | Responsibilities |
|---|---|
| Agency Owner / Manager | Manage clients, marketing campaigns, team members, and analytics. |
| Freelancer | Manage business profiles, content, and marketing activities. |
| Business Owner / Manager | Manage business marketing and social media presence. |
| Agency Team Member | Create content and perform assigned marketing tasks. |
| System Administrator | Manage users, platform activities, and system operations. |

### 7. 🛡️ Admin Dashboard
- Manage registered users.
- Monitor platform activities.
- Manage user accounts and access.
- View system-level statistics.
- Maintain platform administration.

---

## 🛠️ Technology Stack

GrowVix is developed using modern web technologies.

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Tailwind CSS | Responsive UI design |
| Node.js | Backend runtime |
| Express.js | Backend API development |
| MongoDB | Database management |
| Mongoose | Database modeling |
| JWT | Authentication |
| AI APIs | AI-powered content generation |
| Facebook Graph API | Facebook integration |
| LinkedIn API | LinkedIn integration |
| Apify | Data collection and automation |
| Git & GitHub | Version control |

*Note: Integrations and API availability depend on configuration, permissions, and supported platform capabilities.*

---

## 📂 Project Structure

```text
GrowVix/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
├── .gitignore
└── README.md
```

*The structure above is a representative overview. Adjust it to match the actual folders in your repository.*

---

## ⚙️ Installation & Setup

Follow these steps to run GrowVix locally.

### Prerequisites

Make sure you have installed:

- Node.js (LTS)
- npm
- MongoDB (local or MongoDB Atlas)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Azizkhan42/GrowVix.git
```

```bash
cd GrowVix
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

Add your AI and social media API credentials according to the integrations enabled in your project.

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed in your terminal (commonly `http://localhost:5173`).

---

## 🔐 Environment Variables

Never upload real API keys, database credentials, or secret tokens to GitHub.

Configure your environment variables locally and add the production values through your hosting provider's environment settings.

---

## 🚀 Deployment

GrowVix can be deployed using cloud hosting services.

| Component | Deployment Platform |
|---|---|
| Frontend | Vercel |
| Backend | Railway |
| Database | MongoDB Atlas |
| Source Code | GitHub |

Deployment requires appropriate environment variables, API permissions, and production configuration.

---

## 🎯 Project Objectives

The primary objectives of GrowVix are:

- Simplify digital marketing management.
- Reduce manual content creation efforts.
- Provide AI-powered marketing assistance.
- Improve competitor research and analysis.
- Centralize social media management.
- Support data-driven marketing decisions.
- Help agencies and businesses improve their online presence.

---

## 🔮 Future Enhancements

- Advanced AI competitor intelligence.
- More social media platform integrations.
- Automated campaign optimization.
- Advanced audience analysis.
- AI-powered marketing recommendations.
- Detailed reporting and downloadable analytics.
- Enhanced scheduling and automation workflows.

---

## 👨‍💻 Developer

**Aziz Ur Rehman**

Software Engineering Student | Full-Stack Web Developer | AI Enthusiast

GitHub: [@Azizkhan42](https://github.com/Azizkhan42)

Project: [GrowVix Repository](https://github.com/Azizkhan42/GrowVix)

---

## 📄 License

This project is developed as an academic Final Year Project (FYP). Licensing and distribution terms can be defined by the project owner.

---

<p align="center">
  <b>GrowVix – Grow Smarter. Market Better. Achieve More. 🚀</b>
</p>