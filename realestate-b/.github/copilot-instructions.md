# Copilot / AI Agent Instructions for this repo

This file contains concise, actionable guidance to help an AI coding agent become productive in this codebase quickly.

**Big Picture**
- **Backend:** Django project in `realestate-b/` with the Django project config in `realestate-b/realestate/` and apps at `realestate-b/{accounts,agents,properties,bookings,payments,notifications,...}`. The DB used during development is `realestate-b/db.sqlite3`.
- **Frontend:** Next.js (app router) in `realestate-f/` (root of the frontend). Key app code is in `realestate-f/app/`, reusable pieces in `realestate-f/components/`, and auth helpers in `realestate-f/contexts/` and `realestate-f/hooks/`.

**How the pieces interact**
- The frontend calls Django REST API endpoints exposed by each app (`{app}/views.py`, `{app}/serializers.py`, `{app}/urls.py`). Look for DRF `ViewSet`/`APIView` patterns and `DefaultRouter` registrations when adding endpoints.
- Authentication uses a custom user model and custom backend code in `realestate-b/accounts/` (`models.py`, `backends.py`, `serializers.py`). Implement token/refresh-token logic here so both backend and frontend share the same auth contracts.
- Signals are used for cross-cutting logic (see `bookings/signals.py`). Use signals sparingly and only for side-effects that must be decoupled from request handling.

**Developer workflows / commands**
- Create and activate Python venv: PowerShell
```
python -m venv real && .\real\Scripts\Activate.ps1
pip install -r realestate-b/requirements.txt
```
- Run Django dev server from `realestate-b/`:
```
# in PowerShell
cd realestate-b; python manage.py migrate; python manage.py runserver
```
- Run Next.js frontend from `realestate-f/`:
```
cd realestate-f; npm install; npm run dev
```

**Project-specific patterns & conventions**
- **API layer:** Each Django app exposes serializers in `serializers.py` and API views in `views.py`. When adding new endpoints, mirror this structure and add routes in `urls.py` for that app.
- **Auth:** The codebase uses a custom user model under `accounts/`. Do not replace it with Django's default. Add authentication endpoints to `accounts/views.py` and token serializers to `accounts/serializers.py`.
- **Media & files:** Media is stored via Django `MEDIA_*` settings; image-related models live in `property_images/` and `properties/`. Ensure file upload endpoints return URLs compatible with the frontend.
- **Frontend data:** The Next.js frontend keeps UI components in `components/` and page routes under `app/`. Auth state is managed in `contexts/AuthContext.tsx` and `hooks/useAuth.ts`. Update these when changing auth flows.

**Where to implement Refresh Tokens (concrete suggestions)**
- Backend: Add JWT refresh/token support in `realestate-b/accounts/`:
  - Add an auth endpoint (e.g., `accounts/views.py`) that issues access tokens and sets a secure, HTTP-only `refresh` cookie.
  - Use `djangorestframework-simplejwt` (or equivalent), update `realestate-b/realestate/settings.py` to include `SIMPLE_JWT` settings and `CORS_ALLOW_CREDENTIALS = True`.
  - Keep refresh tokens server-side (cookie) and issue short-lived access tokens for API calls.
- Frontend: Implement automatic token refresh in `realestate-f/hooks/useAuth.ts` and `realestate-f/contexts/AuthContext.tsx`:
  - Store only the access token in memory; rely on the refresh cookie for obtaining new access tokens.
  - Implement an interceptor in the API client (see `realestate-f/lib/api/` or `components/auth/`) that retries 401s by calling the refresh endpoint.

**Files to inspect first (high value)**
- `realestate-b/accounts/serializers.py` — current auth serializers.
- `realestate-b/accounts/backends.py` — custom auth logic.
- `realestate-b/realestate/settings.py` — CORS, allowed hosts, installed apps, middleware.
- `realestate-b/properties/views.py` and `realestate-b/properties/serializers.py` — property APIs.
- `realestate-f/contexts/AuthContext.tsx` and `realestate-f/hooks/useAuth.ts` — frontend auth flow and where to add refresh behavior.
- `realestate-f/app/(dashboard)/` — dashboard routes for agent UIs (create/manage properties).

**Conventions & gotchas discovered in the repo**
- There are two codebases in the workspace: the Django backend (`realestate-b/`) and a separate Next.js frontend (`realestate-f/`). Keep changes scoped to one at a time and run both dev servers.
- There is a checked-in Python virtual environment in `real/` — do not modify or add new venv files; prefer updating `requirements.txt` instead.
- The DB file `db.sqlite3` is in the repo root. Treat it as development-only data (do not deploy it to production).

**Quick search patterns**
- Find all DRF routers and viewsets:
  - Search for `DefaultRouter(` or `SimpleRouter(` in `realestate-b/`.
- Find hardcoded frontend data: search for strings like `mock`, `MOCK_`, or JS objects defined in `app/` pages.

**When editing/adding files**
- Keep changes minimal and add tests where practical (`tests.py` in each app). Run `python manage.py test` locally.
- Avoid changing `real/` (venv) and `db.sqlite3` unless explicitly asked.

If any of these sections are unclear or you'd like me to expand examples (e.g., a concrete `accounts/views.py` refresh-token implementation and corresponding `useAuth` hook), tell me which part to author next.
