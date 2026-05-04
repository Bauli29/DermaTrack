# PowerShell equivalent of pre-commit shell script
param()

$repo_root = git rev-parse --show-toplevel

function has_changes {
    param([string[]]$paths)
    $changes = git diff --cached --quiet --diff-filter=ACMR -- $paths
    return $LASTEXITCODE -ne 0
}

$frontend_changed = $false
$backend_changed = $false

if (has_changes frontend/src, frontend/package.json, frontend/next.config.ts, frontend/eslint.config.mjs, frontend/tsconfig.json, frontend/pnpm-lock.yaml) {
    $frontend_changed = $true
}

if (has_changes backend/src, backend/pom.xml, backend/mvnw, backend/mvnw.cmd, backend/Dockerfile) {
    $backend_changed = $true
}

if (-not $frontend_changed -and -not $backend_changed) {
    Write-Host "No frontend or backend product code changes detected. Skipping checks."
    exit 0
}

if ($frontend_changed) {
    Write-Host "Running frontend checks..."
    Push-Location "$repo_root/frontend"

    Write-Host "Checking code formatting..."
    pnpm run format:check
    if ($LASTEXITCODE -ne 0) { exit 1 }

    Write-Host "Running lint check..."
    pnpm run lint:check
    if ($LASTEXITCODE -ne 0) { exit 1 }

    Write-Host "Running tests..."
    pnpm run test
    if ($LASTEXITCODE -ne 0) { exit 1 }

    Write-Host "Running build..."
    pnpm run build
    if ($LASTEXITCODE -ne 0) { exit 1 }

    Pop-Location
}

if ($backend_changed) {
    Write-Host ""
    Write-Host "Running backend tests..."
    Push-Location "$repo_root/backend"

    if (Test-Path ./mvnw) {
        ./mvnw test
    } elseif (Test-Path ./mvnw.cmd) {
        ./mvnw.cmd test
    } elseif (Get-Command mvn -ErrorAction SilentlyContinue) {
        mvn test
    } else {
        Write-Error "ERROR: No Maven wrapper or mvn found. Cannot run backend tests."
        exit 1
    }
    if ($LASTEXITCODE -ne 0) { exit 1 }

    Pop-Location
}

Write-Host ""
Write-Host "Checking backend coverage..."
Push-Location "$repo_root"
if (Get-Command node -ErrorAction SilentlyContinue) {
    node "$repo_root/scripts/pre-commit-backend-coverage.js"
} else {
    Write-Host "Node not found; skipping backend coverage check."
}
Pop-Location

Write-Host ""
Write-Host "Relevant pre-commit checks passed."
exit 0
