 # Minority_Spice
CSC 400 Capstone Project - Diary App

# Project Name
Diary App

## Overview
A brief paragraph explaining what this project does and its purpose.

## Getting Started

### Prerequisites


### Installation
1. Clone the repo: `git clone <repo_url>`
2. Install dependencies: `npm install`
3. Run the project: `npm start`

### Database (SQLite)
- This project uses SQLite. The DB file (`server/classroom_blog.db`) is created automatically on server start using `Database/schema.sql`.
- If you don't have the DB file, just start the server once and it will be generated.

### Admin Bootstrap (Role-Based)
- To create or promote the initial admin account, set these env vars before starting the server:
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
  - `ADMIN_NAME` (optional)
- On startup, if an admin doesn't exist, the server creates one using these values.

### One-Click Admin Setup
- **Mac/Linux:** Run `./start-admin.sh` and follow the prompts.
- **Windows:** Run `start-admin.bat` and follow the prompts.

## Development Workflow
- **Branching Strategy**: Create feature branches from `main` (e.g., `feature/login-page`).
- **Commits**: Use descriptive commit messages.
- **Pull Requests**: Open PRs to `main` for review.
- **db dumps**: "db:dump" saves latest db structure for commit
- **db import**: "db:import" imports latest db structure

## Tech Stack


## License
Distributed under the MIT License. See `LICENSE` for more information.
