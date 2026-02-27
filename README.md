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

## Recent Updates
- **Auth + API reliability**
  - Fixed signup/login flow error handling for proxy/network failures.
  - Improved client-side parsing so empty/non-JSON responses no longer crash auth pages.
  - Added clearer user-facing messaging when backend is unreachable.
- **Post visibility controls**
  - Enabled hide/unhide controls from both profile and dashboard contexts.
  - Kept role-aware behavior: owners can hide their own posts; admins can hide any post.
  - Updated post payloads to include `student_id` so frontend permission checks are accurate.
- **Profile auto-refresh**
  - Profile posts now refresh immediately after creating a new post without manual page reload.
  - Removed disruptive full-page loading flashes during post refreshes.
- **Profile hero + gallery**
  - Upgraded profile header into a full-width hero section.
  - Added gallery upload and viewer support (thumbnail strip + click-to-view + navigation).
  - Gallery uploads no longer change profile background automatically.
  - Added dedicated profile background upload in Edit Profile.
  - Tuned background readability with a subtle blue overlay above hero images.
  - Made gallery panel colors follow the selected profile theme.
- **Directory activity indicator**
  - Replaced demo red-dot logic with real unseen-post logic.
  - Dot now clears after viewing a student profile and reappears only when new posts exist.
- **UI polish**
  - Aligned post card header layout so avatar, name, and actions share one line.
  - Fixed like hover color behavior to match comment hover behavior.
  - Ensured sidebar tooltip labels render above surrounding UI layers.

## Development Workflow
- **Branching Strategy**: Create feature branches from `main` (e.g., `feature/login-page`).
- **Commits**: Use descriptive commit messages.
- **Pull Requests**: Open PRs to `main` for review.
- **db dumps**: "db:dump" saves latest db structure for commit
- **db import**: "db:import" imports latest db structure

## Tech Stack


## License
Distributed under the MIT License. See `LICENSE` for more information.
