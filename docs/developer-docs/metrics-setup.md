<!-- Metrics guide for developers: generate & view reports -->

# Metrics — generate and view reports

This is a short, practical guide for developers: how to generate the CK reports (CI + locally) and where to view them and the SonarCloud analysis.

1. What runs automatically in CI

- The workflow `.github/workflows/metrics.yml` runs on pushes and PRs that touch `backend/` or `frontend/`.
- Backend job: runs CK and produces CSV files (class/method/variable/field).
- Frontend metrics: analyzed by SonarCloud (TypeScript support, built into the main SonarCloud workflow).
- CK CSV outputs are uploaded as GitHub Actions artifacts.

2. How to view the generated reports

**Backend CK metrics:**

- Open the repository → Actions → choose the workflow run.
- In the run page, expand the **Artifacts** panel and download `ck-backend-metrics` (CSV files).

**Frontend & Backend SonarCloud analysis:**

- Open the SonarCloud projects (see links below in section 4).

3. How to run the same reports locally (optional)

Backend (CK via standalone jar — recommended):

Run this from the DermaTrack repo root

```bat
REM clone and build CK (one-time)
git clone https://github.com/mauricioaniche/ck tools\ck
cd /d "%CD%\tools\ck"
call mvnw.cmd -DskipTests clean package

REM run CK against the backend folder (while still in tools\ck)
if not exist ..\..\reports\ck\backend mkdir ..\..\reports\ck\backend
for /f %J in ('dir /b target\*jar-with-dependencies.jar') do set JAR=target\%J
java -jar %JAR% ..\..\backend true 0 false ..\..\reports\ck\backend
```

- Output: CSV files (class.csv, method.csv, variable.csv, field.csv) will be written to `reports/ck/backend`.

Notes:

- Local runs are optional — CI already produces the canonical reports for PRs.
- To get identical results to CI, run the same commands on the same commit and use the same tool versions.

4. Who can see SonarCloud projects and the reports

- SonarCloud project visibility depends on your SonarCloud and GitHub settings:
  - For public GitHub repositories, SonarCloud analysis and the SonarCloud project page are generally viewable publicly.
- GitHub Actions artifacts follow repo visibility:
  - For public repos, workflow runs and artifacts are visible to anyone who can view the repo.
  - For private repos, only people with repo access can download artifacts.

**View SonarCloud projects:**

- Organization dashboard: https://sonarcloud.io/organizations/dermatrack/projects
- Backend project: https://sonarcloud.io/project/overview?id=dermatrack_backend
- Frontend project: https://sonarcloud.io/project/overview?id=dermatrack_frontend

5. Quick summary — what each tool gives you

- **SonarCloud:** CI quality gates, issues, coverage, complexity, and team dashboard for both backend (Java) and frontend (TypeScript/JavaScript). Primary tool for code quality gating.
- **CK:** Deep Java class/method metrics useful for lecture submissions (DIT, NOC, RFC, LCOM, CBO). Produces CSV files; CI-driven or local runs.
- **MetricsReloaded:** Editor-side interactive feedback (use while coding in IntelliJ/VS Code).
