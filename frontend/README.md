This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
"<!-- CI/CD Test -->"


---

## Local Backend Integration

During development, the frontend exposes a small proxy endpoint to talk to the Spring Boot backend without CORS hassles.

- Health proxy route: `/api/backend-health` → calls `${process.env.BACKEND_URL || 'http://localhost:8080'}/actuator/health`
- Configure backend URL for the frontend by creating `.env.local` in `frontend/` (see `.env.local.example`):

```env
BACKEND_URL=http://localhost:8080
```

After starting the backend on port 8080 and `npm run dev` in `frontend`, open http://localhost:3000 — the home page shows a "Backend Health" status.

## Turbopack lockfile warning
If Next.js warns about multiple lockfiles, choose a single package manager for the frontend:
- Keep npm: keep `package-lock.json`, remove `pnpm-lock.yaml`.
- Use PNPM: keep `pnpm-lock.yaml`, remove `package-lock.json` and run `pnpm install`.

Let us know your preference and we will tidy up the lockfiles accordingly.
