# DermaTrack - Project Summary

## 📋 Overview

**DermaTrack** is a comprehensive web application designed for tracking and analyzing skin changes, specifically focused on Neurodermitis (atopic eczema) management. The project enables users to monitor their skin condition over time with detailed logging, symptom tracking, and visual documentation.

**Team:** Bastian, Philip, Johanna, Sebastian, Sribriddhi

**Repository:** [Bauli29/DermaTrack](https://github.com/Bauli29/DermaTrack)  
**Live Demo:** [https://derma-track.vercel.app](https://derma-track.vercel.app)

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js (React)
- **Language:** TypeScript
- **Styling:** [Check frontend documentation]
- **Testing:** Jest with TypeScript support
- **Coverage Target:** 80% across all metrics

### Backend
- **Framework:** Spring Boot (Java)
- **Language:** Java
- **Database:** H2 (development), PostgreSQL/MySQL (production)
- **Build Tool:** Maven
- **Testing:** JUnit with JaCoCo coverage tracking

### DevOps & Deployment
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render
- **CI/CD:** GitHub Actions
- **Code Quality:** SonarCloud
- **Metrics:** CK (Class Complexity Metrics)

---

## 📦 Project Structure

```
DermaTrack/
├── frontend/              # Next.js React application
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── types/        # TypeScript type definitions
│   │   └── context/      # React context providers
│   ├── jest.config.mjs   # Jest testing configuration
│   └── package.json
├── backend/               # Spring Boot application
│   ├── src/
│   ├── pom.xml          # Maven configuration
│   ├── mvnw / mvnw.cmd  # Maven wrapper
│   └── Dockerfile       # Multi-stage Docker build
├── docs/                 # Documentation
│   ├── wiki/            # Wiki documentation
│   └── developer-docs/  # Developer guides
├── scripts/             # Utility scripts
│   ├── mvnw.js         # Cross-platform Maven launcher
│   ├── ci/             # CI helper scripts
│   └── pre-commit/     # Git hook scripts
└── README.md           # Project README
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js & pnpm (frontend)
- Java 25+ & Maven (backend)
- Docker (optional, for containerized development)

### Starting the Full Application

From the project root:

```bash
pnpm dev
```

This command starts both frontend and backend in development mode.

### Starting Individual Services

**Frontend Only:**
```bash
pnpm start
# or
cd frontend && pnpm dev
```

**Backend Only:**
```bash
npm run backend:dev
# or
cd backend && mvn spring-boot:run
```

#### Backend Profile Options
- `local-h2`: In-memory database (recommended for daily development)
- `local`: Real database connection (requires running database)
- `prod`: Production environment settings

---

## ✅ Testing & Coverage

### Frontend Testing
- **Framework:** Jest with ts-jest preset
- **Test Environment:** jsdom
- **Coverage Target:** 80% (statements, branches, functions, lines)
- **Run Tests:** `pnpm test:frontend`

### Backend Testing
- **Framework:** JUnit with JaCoCo
- **Coverage Target:** 80%
- **Run Tests:** `mvn test` or `node scripts/mvnw.js test`

### CI/CD Pipeline
The repository uses GitHub Actions for continuous integration:
- Automated tests on every push and pull request
- Coverage reports generated and artifacts uploaded
- SonarCloud analysis for code quality
- CK metrics for Java code complexity analysis

**Run Pre-commit Coverage Check (Optional):**
```bash
npx husky install
npx husky add .husky/pre-commit "node ./scripts/pre-commit-backend-coverage.js"
```

---

## 📊 Code Quality & Metrics

### SonarCloud Projects
- **Organization Dashboard:** [SonarCloud DermaTrack](https://sonarcloud.io/organizations/dermatrack/projects)
- **Backend Project:** [SonarCloud Backend](https://sonarcloud.io/project/overview?id=dermatrack_backend)
- **Frontend Project:** [SonarCloud Frontend](https://sonarcloud.io/project/overview?id=dermatrack_frontend)

### CK Metrics (Backend)
- Generated during CI pipeline
- Available as GitHub Actions artifacts
- Includes class, method, variable, and field metrics
- Useful for understanding code complexity (DIT, NOC, RFC, LCOM, CBO)

---

## 📚 Documentation

### Developer Documentation
1. **[Metrics Setup Guide](https://github.com/Bauli29/DermaTrack/blob/main/docs/developer-docs/metrics-setup.md)** - How to generate and view code metrics, CK reports, and SonarCloud analysis
2. **[CI/CD Configuration](https://github.com/Bauli29/DermaTrack/blob/main/.github/workflows/)** - GitHub Actions workflows for testing and deployment
3. **[Backend Architecture](https://github.com/Bauli29/DermaTrack/tree/main/backend)** - Spring Boot structure and configuration
4. **[Frontend Architecture](https://github.com/Bauli29/DermaTrack/tree/main/frontend)** - Next.js and React implementation

### Wiki Pages
Access the full wiki at: [DermaTrack Wiki](https://github.com/Bauli29/DermaTrack/wiki)

Key topics typically covered in wikis:
- Feature documentation
- API endpoints
- Database schema
- Setup instructions
- Troubleshooting guides
- Contributing guidelines

---

## 🔐 Authentication & Security

The application implements JWT-based authentication:
- **Access Tokens:** Short-lived JWT tokens for API requests
- **Refresh Tokens:** Long-lived tokens for session management
- **Session Management:** Secure cookie-based session storage
- **Token Validation:** Expiration checks and validation on each request

### Key Auth Components
- **Frontend Auth Hook:** `useAuth()` - React context hook for authentication
- **Token Utils:** JWT parsing, expiration checking, and validation
- **Auth Context:** Centralized state management for user session
- **Route Guards:** Automatic redirection based on authentication status

---

## 🐳 Deployment

### Docker Deployment

**Backend Dockerfile:**
- Multi-stage build for optimized image size
- Runs on Alpine Linux with JRE 25
- Non-root user for security
- Health checks configured
- Port: 8080 (configurable via PORT environment variable)

**Frontend:**
- Deployed via Vercel (automatic deployments from main branch)
- Environment configuration in `.env.local`

### Environment Variables

**Backend:**
- `PORT`: Server port (default: 8080)
- `SPRING_PROFILES_ACTIVE`: Active Spring profile
- `DATABASE_URL`: Database connection string
- See `application.yml` for all configuration options

**Frontend:**
- `NEXT_PUBLIC_API_URL`: Backend API endpoint
- `NEXT_PUBLIC_E2E`: End-to-end testing flag
- See `.env.example` for complete configuration

---

## 🤝 Contributing

### Development Workflow
1. Create a feature branch from `main`
2. Make your changes with test coverage
3. Ensure all tests pass locally: `pnpm test`
4. Ensure linting passes: `pnpm lint`
5. Create a pull request with a clear description
6. Wait for CI checks and code review

### Code Standards
- **Coverage:** Maintain 80%+ test coverage
- **Linting:** Follow project ESLint and Prettier configurations
- **Formatting:** `pnpm format` for auto-formatting
- **Types:** Use TypeScript for type safety

### Pre-commit Hooks
Enable pre-commit checks to catch coverage issues before pushing:
```bash
npx husky install
```

---

## 📝 Key Files Reference

| File | Purpose |
|------|---------|
| `package.json` | Frontend dependencies and scripts |
| `backend/pom.xml` | Backend dependencies and build configuration |
| `scripts/mvnw.js` | Cross-platform Maven wrapper launcher |
| `frontend/jest.config.mjs` | Jest testing configuration |
| `frontend/src/types/auth.ts` | Authentication TypeScript interfaces |
| `frontend/src/hooks/use-auth.tsx` | Auth context hook for React components |
| `frontend/proxy.ts` | Next.js middleware for auth routing |
| `backend/Dockerfile` | Backend containerization |
| `.github/workflows/` | GitHub Actions CI/CD pipelines |
| `docs/developer-docs/` | Developer guides and documentation |

---

## 🔗 Important Links

- **Repository:** https://github.com/Bauli29/DermaTrack
- **Live Application:** https://derma-track.vercel.app
- **Issues & Projects:** https://github.com/Bauli29/DermaTrack/issues
- **Pull Requests:** https://github.com/Bauli29/DermaTrack/pulls
- **GitHub Wiki:** https://github.com/Bauli29/DermaTrack/wiki
- **SonarCloud:** https://sonarcloud.io/organizations/dermatrack/projects

---

## ❓ Frequently Asked Questions

**Q: How do I start development locally?**  
A: Run `pnpm dev` from the project root to start both frontend and backend.

**Q: Which backend profile should I use?**  
A: Use `local-h2` for quick local development (in-memory database).

**Q: Where do I check test coverage?**  
A: Frontend coverage from Jest output, backend coverage from SonarCloud dashboard or GitHub Actions artifacts.

**Q: How do I deploy changes?**  
A: Frontend auto-deploys from main branch to Vercel. Backend requires manual deployment to Render or your hosting provider.

**Q: How do I run metrics locally?**  
A: See [Metrics Setup Guide](https://github.com/Bauli29/DermaTrack/blob/main/docs/developer-docs/metrics-setup.md)

---

**Last Updated:** May 31, 2026  
**Status:** Active Development

For more information, visit the [DermaTrack Wiki](https://github.com/Bauli29/DermaTrack/wiki) or check the [Repository README](https://github.com/Bauli29/DermaTrack/blob/main/README.md).
