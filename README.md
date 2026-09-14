# Personal Blog

A blog app built with Express, EJS, and MongoDB (Mongoose). Public pages list and show posts; an admin area (session-based login) lets you create, edit, and delete posts.

## Setup

1. Copy `.env.example` to `.env` and fill in the values (a running MongoDB instance, a session secret, and admin credentials for seeding).
2. Install dependencies:
   ```
   npm install
   ```
3. Create the admin user (reads `ADMIN_USERNAME`/`ADMIN_PASSWORD` from `.env`):
   ```
   npm run seed:admin
   ```
4. Start the app:
   ```
   npm run dev
   ```
5. Visit `http://localhost:3000`, and `http://localhost:3000/login` to sign in as admin.

## Running with Docker

`docker-compose.yml` just builds and runs the app container — it connects to whatever `MONGO_URI` is set to in `.env` (Atlas or otherwise). There's no bundled MongoDB container.

1. Copy `.env.example` to `.env` and fill in `MONGO_URI`, `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`.
2. Build and start it:
   ```
   docker compose up --build
   ```
3. In another terminal, seed the admin user (and optionally sample posts):
   ```
   docker compose exec app npm run seed:admin
   docker compose exec app npm run seed:posts
   ```
4. Visit `http://localhost:3000`.
5. Stop with `docker compose down`.

## Deploying to Kubernetes

Plain manifests live in `k8s/` — no Helm, no bundled MongoDB (it talks to the same external database as everywhere else, e.g. Atlas):

- `namespace.yaml` — the `personal-blog` namespace everything else lives in
- `configmap.yaml` — non-sensitive config: `PORT`, `ADMIN_USERNAME`
- `secret.yaml` — sensitive values: `MONGO_URI` (a connection string usually embeds credentials, so it belongs here, not the ConfigMap), `SESSION_SECRET`, `ADMIN_PASSWORD`. **This file holds real credentials and is gitignored — never commit it.** `secret.yaml.example` has the same structure with placeholder values; copy it to `secret.yaml` and fill in real values before applying.
- `app.yaml` — the app: a Deployment (reads both the ConfigMap and Secret via `envFrom`), a Service

The namespace has to exist before anything that lives in it, so apply it first:
```
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/
kubectl set image deployment/personal-blog app=your-registry/personal-blog:sometag -n personal-blog
kubectl rollout status deployment/personal-blog -n personal-blog
```

Then seed the admin user and sample posts the same way as Docker, via `kubectl exec` instead of `docker compose exec`:
```
kubectl exec deploy/personal-blog -n personal-blog -- npm run seed:admin
kubectl exec deploy/personal-blog -n personal-blog -- npm run seed:posts
```

Reach the app with `kubectl port-forward svc/personal-blog -n personal-blog 3000:80`.

This was validated end-to-end against a real cluster (a throwaway `kind` cluster) — applied cleanly, the pod reached `Running`, connected to Atlas, and was reachable and seedable through it.

## CI/CD (Jenkins)

The `Jenkinsfile` at the repo root defines a pipeline: checkout → `npm ci` → syntax check → build & push the Docker image → `kubectl apply` + `kubectl set image` + `kubectl rollout status` against a cluster. It expects two Jenkins credentials to exist:
- `registry-credentials` — username/password for your container registry
- `kubeconfig` — a Secret file credential holding a kubeconfig for the target cluster

Update the `REGISTRY`, `REGISTRY_CREDS`, and `KUBECONFIG_CREDS` values at the top of the `Jenkinsfile` to match your setup. There's no automated test suite yet, so the pipeline only does a `node -c` syntax pass rather than running `npm test`.

## Structure

- `app.js` — server entry point
- `config/db.js` — MongoDB connection
- `models/` — Mongoose schemas (`Post`, `User`)
- `services/` — business logic and data access (`postService.js`, `authService.js`)
- `controllers/` — request handlers that call services (`postController.js`, `adminController.js`, `authController.js`, `api/postApiController.js`)
- `routes/` — thin route wiring: `posts.js` (public), `admin.js` (CRUD, requires login), `auth.js` (login/logout), `api/posts.js` (JSON API)
- `middleware/auth.js` — session-based `requireAuth` / `requireAuthApi` guards
- `views/` — EJS templates (`views/admin/` for the dashboard and post form)
- `public/css/style.css` — styling
- `scripts/createAdmin.js` — one-off script to create/update the admin user
- `scripts/seedPosts.js` — seeds a few sample posts
- `Dockerfile`, `docker-compose.yml` — containerized app for local runs (connects to `MONGO_URI` from `.env`)
- `k8s/` — plain Kubernetes manifests for the app (namespace, configmap, secret, deployment/service)
- `Jenkinsfile` — CI/CD pipeline: build, push image, deploy to a cluster with `kubectl`
