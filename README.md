# URL Shortener — 3-Tier Microservice App with End-to-End CI/CD on AWS

A URL shortener with click analytics, built as a hands-on DevOps practice project. The app itself is intentionally simple — the real focus is the full CI/CD pipeline and AWS infrastructure behind it: Jenkins for code-quality/security gates, AWS CodePipeline + CodeBuild for build/deploy automation, and EKS for orchestration, all provisioned with Terraform.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│   React     │────▶│   Express   │────▶│  MongoDB Atlas    │
│  Frontend   │     │   Backend   │     │  (managed, AWS)   │
└─────────────┘     └─────────────┘     └──────────────────┘
       │                    │
       └──────────┬─────────┘
                   ▼
         AWS Application Load Balancer
         (single entry point via Ingress)
                   │
                   ▼
              EKS Cluster
        (frontend + backend pods,
         AWS Load Balancer Controller)
```

- **Frontend**: React, served via Nginx, calls the backend using relative paths (`/api/...`) — same-origin, no CORS, no hardcoded backend URLs.
- **Backend**: Node.js/Express, REST API for shortening URLs, redirects (`/r/:shortCode`), and click analytics.
- **Database**: MongoDB Atlas (free tier, hosted on AWS infrastructure) — avoids managing database servers directly.
- **Routing**: A single AWS ALB, created and managed by the **AWS Load Balancer Controller**, with path-based rules:
  - `/` → frontend
  - `/api`, `/r`, `/health` → backend

## Infrastructure (Terraform)

All AWS infrastructure is defined as code and fully reproducible via `terraform apply` / `terraform destroy`:

| Resource | Purpose |
|---|---|
| VPC, subnets, NAT Gateway | Networking for the EKS cluster |
| EKS cluster + managed node group | Runs the application pods |
| ECR repositories (frontend, backend) | Stores built Docker images |
| IAM roles & policies | Scoped permissions for CodeBuild, CodePipeline, and the ALB Controller (via IRSA) |
| AWS Load Balancer Controller (Helm, via Terraform) | Watches Ingress resources and provisions the ALB automatically |
| CodePipeline, CodeBuild, S3 artifact bucket | AWS-native build/deploy automation |

Kubernetes manifests (Deployments, Services, Ingress, Secrets) live separately under `k8s/` and are applied during the CodeBuild deploy phase — not managed by Terraform, by design, to keep app-level config decoupled from infrastructure.

## CI/CD Pipeline

```
Developer push to GitHub
        │
        ▼
┌─────────────────────────────────────────────┐
│                  Jenkins                     │
│  (triggered via GitHub webhook on every push)│
│                                               │
│  1. Checkout code                            │
│  2. SonarQube — static code analysis          │
│  3. Gitleaks — secrets scanning               │
│        │                                     │
│        ▼ (only if both stages pass)           │
│  4. Trigger AWS CodePipeline                  │
│     (aws codepipeline start-pipeline-execution)│
└─────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────┐
│              AWS CodePipeline                │
│                                               │
│  Source  → (pipeline triggered by Jenkins)    │
│  Build   → AWS CodeBuild:                    │
│             - docker build (frontend, backend)│
│             - docker push → ECR               │
│             - update kubeconfig               │
│             - kubectl apply (Deployments,      │
│               Services, Ingress, Secrets)      │
│             - kubectl rollout restart          │
└─────────────────────────────────────────────┘
        │
        ▼
              EKS Cluster (live app updated)
```

### Why this split between Jenkins and CodePipeline

- **Jenkins** acts purely as a **quality/security gate**, running on a self-hosted Ubuntu machine. It never touches Docker builds or deployment — its only job is to stop bad code from reaching AWS.
  - **SonarQube**: catches code smells, bugs, and security vulnerabilities in the actual application code.
  - **Gitleaks**: scans for accidentally committed secrets (API keys, credentials) before anything proceeds further. (GitGuardian was evaluated as an alternative; the pipeline currently uses Gitleaks.)
- **AWS CodePipeline + CodeBuild** handles everything AWS-native: building images, pushing to ECR, and deploying to EKS. This keeps cloud-specific build/deploy logic fully inside AWS, authenticated via IAM roles rather than long-lived credentials stored in Jenkins.
- **ECR image scanning** (scan-on-push, enabled at the repository level) provides a second layer of security — checking built images for OS/dependency CVEs — without adding a redundant scanning tool to the Jenkins stage.

### Authentication between Jenkins and AWS
Jenkins triggers CodePipeline using an IAM user's access key, stored as an **AWS Credentials** entry in Jenkins' credential store (never hardcoded in the Jenkinsfile or committed to git).

## Key engineering decisions made during this project

- **Single ALB via Ingress, not per-service LoadBalancers** — avoids the "frontend can't reach a stable backend URL" problem entirely, since both tiers share one origin and the frontend uses relative API paths.
- **AWS Load Balancer Controller installed via Terraform** (IAM role + IRSA + Helm release), not manual `eksctl`/`helm install` commands — so the entire cluster, including this controller, is destroyed and recreated identically every time, with no manual setup steps to repeat.
- **MongoDB Atlas over self-hosted/DocumentDB** — free tier, zero StatefulSet/PV complexity, lets pipeline debugging focus on CI/CD rather than database operations.
- **Secrets via Kubernetes Secrets, not plain env vars in manifests** — `MONGO_URI` is injected via `secretKeyRef`, created imperatively via `kubectl create secret`, and never committed to the repo.
- **Node group sized for free-tier (`t3.micro`)** — required tuning pod scheduling (`desired_size`, ALB controller replica count) to fit within free-tier instance limits without forcing instance type upgrades.

## Local development

```bash
# Backend
cd backend && cp .env.example .env && npm install && npm run dev

# Frontend
cd frontend && cp .env.example .env && npm install && npm start
```

MongoDB connection defaults to a local instance; swap `MONGO_URI` in `.env` to point at Atlas or any other MongoDB instance.

## Notable issues solved along the way (for anyone retracing this build)

- **Node.js CA certificate mismatch with MongoDB Atlas** — Node's bundled CA store didn't recognize a newer Let's Encrypt root; fixed via `NODE_EXTRA_CA_CERTS` pointing at the system's CA bundle.
- **EKS managed node group `desired_size` not respected on reapply** — the Terraform EKS module ignores changes to `desired_size` after initial creation by design; scaling afterward requires `aws eks update-nodegroup-config` directly.
- **ALB target group health checks failing (404)** — the default `/` health check path didn't exist on the backend; fixed by scoping a `healthcheck-path: /health` annotation to the backend Service specifically (not the Ingress globally, which would have broken the frontend's check instead).
- **Compromised AWS access key (`AWSCompromisedKeyQuarantineV3`)** — a key was accidentally committed to a public GitHub repo and auto-quarantined by AWS within the same session; resolved by rotating the key via the AWS root user (the restricted IAM user couldn't fix its own quarantine) and rebuilding infrastructure from scratch.

## License

MIT