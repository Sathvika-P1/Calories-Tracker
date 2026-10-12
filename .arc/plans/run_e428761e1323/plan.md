summary: |
  This repository is currently greenfield: besides the design system assets and ADRs there is no
  application code for either `comp_calorie_tracker_api` or `comp_web_app` (no package.json,
  tsconfig, Prisma schema, or src files exist anywhere in the worktree). STORY-011 is therefore
  also the first story that stands up real, runnable code for both components, scoped tightly to
  what login requires: a pnpm workspace with an `api/` (Fastify + Prisma) package and a `web/`
  (React + Vite + Tailwind) package. The API gets a `User` model, password hashing, and
  cookie-session login/session/logout routes. The web app gets the Login screen and the
  authenticated Home screen exactly as shown in the approved prototype
  (`.arc/designs/CALORIE-TRACKER-STORY-011-design.html`), a React auth context that hydrates from
  the API, and a route guard that redirects unauthenticated visitors to `/login`. No
  registration/third-party-auth is built (ADR-0007: no third-party integrations; "Create an
  account" is an inert placeholder in the design), so tests seed registered users directly against
  the database.
scope:
- description: |
    Create the pnpm workspace skeleton so the two components can be installed/built/tested
    independently. Add root `pnpm-workspace.yaml` listing `api` and `web`, a minimal root
    `package.json` (`private: true`, workspace-wide `dev`/`test` scripts that fan out via
    `pnpm -r`), and append `DATABASE_URL` / `JWT_SECRET` dev defaults to the existing root `.env`
    (which already holds `ARC_DEV_PORT=8011` and `ARC_WEB_PORT=3011`).
  files:
  - pnpm-workspace.yaml
  - package.json
  - .env
  - .gitignore
  rationale: |
    Confirmed stack requires pnpm for both components; nothing in the repo currently declares a
    workspace or where `api`/`web` live, so this has to be established before any component code
    can be added. `.gitignore` is added because none exists and `node_modules`/`dist`/`.env.local`
    must not be committed once dependencies are installed.
- description: |
    Scaffold the API package and its Prisma-backed `User` model: `api/package.json`,
    `api/tsconfig.json`, `api/prisma/schema.prisma` with a `User` model, and a Fastify plugin that
    decorates the instance with a `PrismaClient`.

    ```prisma
    model User {
      id           String   @id @default(uuid())
      username     String   @unique
      passwordHash String
      createdAt    DateTime @default(now())
    }
    ```
  files:
  - api/package.json
  - api/tsconfig.json
  - api/prisma/schema.prisma
  - api/src/plugins/prisma.ts
  rationale: |
    ADR-0002 (PostgreSQL via Prisma) and ADR-0001 (API owns persistence). A registered user has to
    exist somewhere for AC1/AC2 to check credentials against; no signup story exists yet, so this
    is the minimal schema login needs, not a general user-profile model.
- description: |
    Add password hashing and session (JWT-in-cookie) helpers used by the login route.

    ```ts
    // api/src/lib/password.ts
    export async function hashPassword(plain: string): Promise<string>
    export async function verifyPassword(plain: string, hash: string): Promise<boolean>
    ```

    ```ts
    // api/src/lib/session.ts
    export const SESSION_COOKIE = "session";
    export function signSession(app: FastifyInstance, payload: { sub: string; username: string }): string
    export function readSession(app: FastifyInstance, token: string): { sub: string; username: string } | null
    ```
  files:
  - api/src/lib/password.ts
  - api/src/lib/session.ts
  rationale: |
    Isolates the two security-sensitive primitives (hashing, token signing/verification) behind
    small functions so the route handler and its tests stay focused on request/response behavior
    rather than crypto details.
- description: |
    Test-first: implement `POST /auth/login`, `GET /auth/session`, and `POST /auth/logout` on a
    `buildApp()` factory, plus the Fastify app/server wiring and Vitest+Supertest test harness.

    ```ts
    // api/src/app.ts
    export function buildApp(opts?: { prisma?: PrismaClient }): FastifyInstance
    ```

    Route contract:
    - `POST /auth/login` body `{ username, password }` →
      - `400 { errors: { username?: string; password?: string } }` when either is empty/missing
        (checked before any DB lookup)
      - `401 { error: "invalid_credentials" }` when the user doesn't exist or the password is
        wrong (no `Set-Cookie`)
      - `200 { user: { id, username } }` with a `Set-Cookie: session=<jwt>; HttpOnly` on success
    - `GET /auth/session` → `200 { user }` if the cookie is present and valid, else
      `401 { error: "unauthenticated" }`
    - `POST /auth/logout` → `200 {}` and clears the `session` cookie
  files:
  - api/src/routes/auth.ts
  - api/src/app.ts
  - api/src/server.ts
  - api/test/helpers/db.ts
  - api/test/auth.login.test.ts
  - api/test/auth.session.test.ts
  - api/vitest.config.ts
  rationale: |
    Directly implements AC1 (valid login succeeds), AC2 (wrong password denied with an error),
    AC3 (empty-field validation, no submission/DB hit), and the backend half of AC4 (a protected
    endpoint rejects an absent/invalid session so the frontend route guard has something real to
    check). `test/helpers/db.ts` creates/removes a test user directly via Prisma since there is no
    registration endpoint to create one through.
- description: |
    Scaffold the web app: Vite + React + TypeScript + Tailwind config, and wire the design system
    into the app's global stylesheet rather than re-deriving tokens. `src/styles/index.css` adds
    the Tailwind directives and `@import`s `../../design-system/tokens.css` and
    `../../design-system/prototype-utils.css` (the shared `.btn`/`.card`/`.input`/`.label` classes
    already used by the prototype). The prototype's screen-specific CSS (the second `<style>`
    block in the design file, `.auth-shell`, `.auth-card`, `.brand-mark`, `.auth-subtitle`,
    `.field-group`, `.input.has-error`, `.field-error`, `.form-banner`, `.auth-links`, `.spinner`,
    `.redirect-note`, `.app-topbar`, `.app-nav`, `.app-user`, `.app-body`, `.welcome-banner`,
    `.card-grid`) is ported verbatim into `src/styles/auth.css` and `src/styles/app-shell.css`,
    since that CSS *is* the approved design for these two screens.
  files:
  - web/package.json
  - web/tsconfig.json
  - web/vite.config.ts
  - web/tailwind.config.ts
  - web/postcss.config.js
  - web/index.html
  - web/src/main.tsx
  - web/src/App.tsx
  - web/src/styles/index.css
  - web/src/styles/auth.css
  - web/src/styles/app-shell.css
  rationale: |
    Confirmed stack is React + Vite + Tailwind for comp_web_app; the design system already defines
    tokens/shared classes as plain CSS custom properties and classes (not Tailwind utilities), so
    importing them once keeps the login screens pixel-faithful to the approved prototype instead
    of re-implementing the same visual spec as Tailwind utility soup.
- description: |
    Add the API client, auth context, route guard, and client-side validation, test-first.

    ```ts
    // web/src/auth/validateLoginForm.ts
    export function validateLoginForm(values: { username: string; password: string }):
      { username?: string; password?: string }
    ```

    ```tsx
    // web/src/auth/AuthContext.tsx
    type AuthStatus = "loading" | "authenticated" | "unauthenticated";
    export function useAuth(): {
      status: AuthStatus;
      user: { id: string; username: string } | null;
      login(username: string, password: string): Promise<{ ok: true } | { ok: false; error: "invalid_credentials" }>;
      logout(): Promise<void>;
    }
    ```

    `RequireAuth` renders its children when `status === "authenticated"`, renders nothing while
    `"loading"`, and otherwise redirects to `/login` carrying the attempted route's display name
    (e.g. `"Today"` for `/`) so the login screen can show the design's redirect banner.
  files:
  - web/src/lib/apiClient.ts
  - web/src/auth/AuthContext.tsx
  - web/src/auth/RequireAuth.tsx
  - web/src/auth/validateLoginForm.ts
  - web/src/auth/validateLoginForm.test.ts
  - web/src/auth/AuthContext.test.tsx
  - web/vitest.config.ts
  - web/src/test/setup.ts
  rationale: |
    `validateLoginForm` gives AC3 a pure, directly-testable unit instead of only end-to-end
    coverage. `AuthContext` centralizes session state (hydrated via `GET /auth/session` on load)
    so both the route guard (AC4) and the Home screen's "Log out" affordance share one source of
    truth instead of duplicating fetch calls.
- description: |
    Build the Login screen and the authenticated Home screen matching the prototype's six states
    (`Login — Default`, `Login — Redirected`, `Login — Validation error`, `Login — Submitting`,
    `Login — Incorrect password`, `Home — Authenticated (Today)`).

    `LoginPage`: `.auth-shell > .auth-card` with brand mark "Calorie Tracker", subtitle "Log in to
    continue tracking your day.", `.field-group`/`.label`/`.input` pairs for Username
    (`autocomplete="username"`) and Password (`autocomplete="current-password"`), a full-width
    `.btn.btn-primary` "Log in" (relabels to "Logging in…" with the `.spinner` and disables
    inputs while pending), a `.redirect-note` banner when arriving via `RequireAuth`'s redirect, a
    `.form-banner.error` with the exact copy "That username and password combination doesn't
    match our records. Check your password and try again." on `invalid_credentials` (clearing the
    password field, keeping the typed username, matching `aria-invalid` on the password input),
    and inline `.field-error` ("Enter your username."/"Enter your password.") with
    `aria-describedby` on empty-field submission. "Forgot password?" / "Create an account" render
    as inert links exactly as in the prototype (no story covers them yet).

    `HomePage`: `.app-topbar` with brand mark, `.app-nav` (Today active via `NavLink`, Food
    Diary/Goals/Progress rendered inert — those sections have no routes yet), `.app-user` showing
    the username and a "Log out" button, `.welcome-banner` ("Welcome back, {username}. Here's
    where today stands."), and a `.card-grid` of three `.card`s (Today kcal, Logged meals, Goal)
    using the prototype's placeholder copy, since real meal/goal data is out of this story's
    scope.
  files:
  - web/src/pages/LoginPage.tsx
  - web/src/pages/HomePage.tsx
  rationale: |
    These are the only two screens the approved design shows for this story; every class name and
    piece of copy above is taken directly from
    `.arc/designs/CALORIE-TRACKER-STORY-011-design.html` (lines ~458-661) rather than invented.
- description: |
    Add Playwright config and an end-to-end spec exercising all four ACs against the real app with
    the API mocked at the network boundary via `page.route`.
  files:
  - web/playwright.config.ts
  - web/e2e/login.spec.ts
  rationale: |
    Playwright is the confirmed e2e tool for comp_web_app. Mocking `/auth/*` at the network layer
    keeps these specs hermetic (no live Postgres/API process required in CI for the frontend
    suite) while still driving the real rendered UI end-to-end; the API's own behavior is proven
    separately by the Supertest suite in scope item 4.
tests:
- |
  (AC1, API) `api/test/auth.login.test.ts` — valid credentials succeed and set a session cookie:
  ```ts
  await createTestUser({ username: "jordan.lee", password: "Calorie2024!" });
  const res = await request(app.server).post("/auth/login")
    .send({ username: "jordan.lee", password: "Calorie2024!" });
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ user: { id: expect.any(String), username: "jordan.lee" } });
  expect(res.headers["set-cookie"][0]).toMatch(/^session=/);
  ```
- |
  (AC1, Playwright) `web/e2e/login.spec.ts` — successful login lands on the home screen:
  ```ts
  await page.route("**/auth/login", (route) =>
    route.fulfill({ status: 200, json: { user: { id: "1", username: "jordan.lee" } } }));
  await page.goto("/login");
  await page.getByLabel("Username").fill("jordan.lee");
  await page.getByLabel("Password").fill("Calorie2024!");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByText("Welcome back, jordan.lee. Here's where today stands.")).toBeVisible();
  ```
- |
  (AC2, API) `api/test/auth.login.test.ts` — wrong password is denied, no cookie set:
  ```ts
  await createTestUser({ username: "jordan.lee", password: "Calorie2024!" });
  const res = await request(app.server).post("/auth/login")
    .send({ username: "jordan.lee", password: "wrong-password" });
  expect(res.status).toBe(401);
  expect(res.body).toEqual({ error: "invalid_credentials" });
  expect(res.headers["set-cookie"]).toBeUndefined();
  ```
- |
  (AC2, Playwright) `web/e2e/login.spec.ts` — incorrect-password banner shown, access denied:
  ```ts
  await page.route("**/auth/login", (route) =>
    route.fulfill({ status: 401, json: { error: "invalid_credentials" } }));
  await page.goto("/login");
  await page.getByLabel("Username").fill("jordan.lee");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "That username and password combination doesn't match our records. Check your password and try again.");
  await expect(page).toHaveURL("/login");
  ```
- |
  (AC3, API) `api/test/auth.login.test.ts` — empty fields rejected before any credential check:
  ```ts
  const res = await request(app.server).post("/auth/login").send({ username: "", password: "" });
  expect(res.status).toBe(400);
  expect(res.body).toEqual({ errors: { username: "Enter your username.", password: "Enter your password." } });
  ```
- |
  (AC3, Vitest unit) `web/src/auth/validateLoginForm.test.ts`:
  ```ts
  expect(validateLoginForm({ username: "", password: "" })).toEqual({
    username: "Enter your username.",
    password: "Enter your password.",
  });
  expect(validateLoginForm({ username: "jordan.lee", password: "Calorie2024!" })).toEqual({});
  ```
- |
  (AC3, Playwright) `web/e2e/login.spec.ts` — submitting with empty fields shows inline errors and
  never calls the API:
  ```ts
  let called = false;
  await page.route("**/auth/login", (route) => { called = true; route.continue(); });
  await page.goto("/login");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText("Enter your username.")).toBeVisible();
  await expect(page.getByText("Enter your password.")).toBeVisible();
  expect(called).toBe(false);
  ```
- |
  (AC4, API) `api/test/auth.session.test.ts` — no cookie means unauthenticated:
  ```ts
  const res = await request(app.server).get("/auth/session");
  expect(res.status).toBe(401);
  expect(res.body).toEqual({ error: "unauthenticated" });
  ```
- |
  (AC4, Playwright) `web/e2e/login.spec.ts` — visiting the protected home route while
  unauthenticated redirects to the login form with the design's redirect banner:
  ```ts
  await page.route("**/auth/session", (route) =>
    route.fulfill({ status: 401, json: { error: "unauthenticated" } }));
  await page.goto("/");
  await expect(page).toHaveURL("/login");
  await expect(page.getByText(/Log in to view/)).toBeVisible();
  await expect(page.getByText("Today")).toBeVisible();
  ```
assumptions_or_open_questions:
- |
  Repo layout: there is no existing `api/`/`web`/`apps/` convention anywhere in the worktree
  (CHORE-004 "configure project build/test setup" is in the git log but produced no files present
  in this checkout), so this plan introduces `api/` and `web/` as sibling pnpm workspace packages
  at the repo root, next to the existing `design-system/` directory. Flagging in case a different
  layout was intended elsewhere and simply isn't visible here.
- |
  Session strategy: an httpOnly JWT cookie named `session`, not a bearer token returned to
  JavaScript. Chosen because the design has no token-handling UI and this avoids storing the
  token in localStorage (XSS exposure). Cookie flags are `HttpOnly; SameSite=Lax` for local dev
  (http, same-site ports 3011/8011); production `Secure`/`SameSite` settings depend on the actual
  prod domain layout, which no ADR specifies, so that's left as a follow-up for deployment work.
- |
  No registration/sign-up endpoint is built. ADR-0007 rules out a third-party identity provider,
  and no story yet covers self-service account creation — the prototype's "Create an account" and
  "Forgot password?" links are inert placeholders there too. Tests create a "registered user"
  directly via Prisma (`api/test/helpers/db.ts`).
- |
  "Log out" is given a minimal real implementation (calls `POST /auth/logout`, clears client
  auth state, navigates to `/login`) purely so the Home screen the design shows isn't left with a
  dead button — no AC mentions logout, so its test coverage is intentionally not exhaustive.
  Flagging for the reviewer to confirm this small bit of extra wiring is acceptable.
- |
  AC4 ("a page that requires login") is demonstrated with the single protected route this story
  actually builds: `/` (the Today/home screen). Food Diary/Goals/Progress have no routes yet since
  those are separate future stories, so they aren't individually gated here.
- |
  Password hashing uses `bcryptjs` (pure JS) rather than `bcrypt` (native bindings) to avoid
  native build/toolchain requirements in CI and the ECS Fargate container image; this is a
  reasonable default but flagged in case the team wants `bcrypt` specifically.
package_dependencies:
- name: fastify
  version: ^4.28.0
  ecosystem: npm
  component_id: comp_calorie_tracker_api
  rationale: Confirmed API framework; no package.json/deps exist yet in this greenfield repo.
- name: "@fastify/cookie"
  version: ^9.3.1
  ecosystem: npm
  component_id: comp_calorie_tracker_api
  rationale: Reads/writes the httpOnly session cookie used by the login/session/logout routes.
- name: "@fastify/jwt"
  version: ^8.0.1
  ecosystem: npm
  component_id: comp_calorie_tracker_api
  rationale: Signs and verifies the session token embedded in the cookie.
- name: "@fastify/cors"
  version: ^9.0.1
  ecosystem: npm
  component_id: comp_calorie_tracker_api
  rationale: Web app (port 3011) and API (port 8011) are different origins in dev; CORS with credentials is required for the cookie-based session to be sent cross-origin.
- name: "@prisma/client"
  version: ^5.19.1
  ecosystem: npm
  component_id: comp_calorie_tracker_api
  rationale: ADR-0002 — PostgreSQL access via Prisma for the User model.
- name: prisma
  version: ^5.19.1
  ecosystem: npm
  component_id: comp_calorie_tracker_api
  rationale: Prisma CLI/dev dependency for schema migrations and client generation.
- name: bcryptjs
  version: ^2.4.3
  ecosystem: npm
  component_id: comp_calorie_tracker_api
  rationale: Password hashing/verification for stored credentials (pure JS, no native build step).
- name: "@types/bcryptjs"
  version: ^2.4.6
  ecosystem: npm
  component_id: comp_calorie_tracker_api
  rationale: TypeScript types for bcryptjs.
- name: typescript
  version: ^5.5.4
  ecosystem: npm
  component_id: comp_calorie_tracker_api
  rationale: Confirmed language for the API; no manifest exists yet.
- name: tsx
  version: ^4.16.2
  ecosystem: npm
  component_id: comp_calorie_tracker_api
  rationale: Runs the Fastify TypeScript server directly in dev without a separate build step.
- name: vitest
  version: ^2.0.5
  ecosystem: npm
  component_id: comp_calorie_tracker_api
  rationale: Confirmed unit test runner for the API.
- name: supertest
  version: ^7.0.0
  ecosystem: npm
  component_id: comp_calorie_tracker_api
  rationale: Confirmed e2e/HTTP test tool for the API's auth routes.
- name: "@types/supertest"
  version: ^6.0.2
  ecosystem: npm
  component_id: comp_calorie_tracker_api
  rationale: TypeScript types for supertest.
- name: "@types/node"
  version: ^20.14.15
  ecosystem: npm
  component_id: comp_calorie_tracker_api
  rationale: Node type definitions for the TypeScript Fastify codebase.
- name: react
  version: ^18.3.1
  ecosystem: npm
  component_id: comp_web_app
  rationale: Confirmed web framework; no manifest exists yet.
- name: react-dom
  version: ^18.3.1
  ecosystem: npm
  component_id: comp_web_app
  rationale: React DOM renderer.
- name: react-router-dom
  version: ^6.26.0
  ecosystem: npm
  component_id: comp_web_app
  rationale: Client-side routing for /login and the protected home route (AC4's redirect behavior).
- name: vite
  version: ^5.4.0
  ecosystem: npm
  component_id: comp_web_app
  rationale: Confirmed build tool for the web app.
- name: "@vitejs/plugin-react"
  version: ^4.3.1
  ecosystem: npm
  component_id: comp_web_app
  rationale: React fast-refresh/JSX support in Vite.
- name: typescript
  version: ^5.5.4
  ecosystem: npm
  component_id: comp_web_app
  rationale: Confirmed language for the web app.
- name: tailwindcss
  version: ^3.4.9
  ecosystem: npm
  component_id: comp_web_app
  rationale: Confirmed styling tool for the web app.
- name: postcss
  version: ^8.4.41
  ecosystem: npm
  component_id: comp_web_app
  rationale: Required by Tailwind's build pipeline.
- name: autoprefixer
  version: ^10.4.20
  ecosystem: npm
  component_id: comp_web_app
  rationale: Standard PostCSS companion for Tailwind vendor-prefixing.
- name: vitest
  version: ^2.0.5
  ecosystem: npm
  component_id: comp_web_app
  rationale: Confirmed unit test runner for the web app (validateLoginForm, AuthContext tests).
- name: "@testing-library/react"
  version: ^16.0.0
  ecosystem: npm
  component_id: comp_web_app
  rationale: Component-level testing for AuthContext/hooks used by the login flow.
- name: "@testing-library/jest-dom"
  version: ^6.4.8
  ecosystem: npm
  component_id: comp_web_app
  rationale: DOM matchers for the Testing Library assertions above.
- name: jsdom
  version: ^24.1.1
  ecosystem: npm
  component_id: comp_web_app
  rationale: DOM environment for Vitest component tests.
- name: "@playwright/test"
  version: ^1.46.0
  ecosystem: npm
  component_id: comp_web_app
  rationale: Confirmed e2e test tool for the web app's login/redirect flows.
- name: "@types/react"
  version: ^18.3.3
  ecosystem: npm
  component_id: comp_web_app
  rationale: TypeScript types for React.
- name: "@types/react-dom"
  version: ^18.3.0
  ecosystem: npm
  component_id: comp_web_app
  rationale: TypeScript types for react-dom.
notes: |
  Both ADR-0007 (no third-party integrations/identity provider) and ADR-0008 (no specific
  compliance regime) support building a plain username/password login rather than integrating an
  external auth provider.

  The repository has no application code at all yet (verified via glob across the whole worktree
  for `package.json`, `*.ts/tsx`, `pnpm-workspace.yaml`, etc. — none exist outside
  `design-system/` and `.arc/`), so this plan necessarily includes scaffolding both components,
  not just the login feature code, to have anywhere to put it.

  ```mermaid
  flowchart TD
    subgraph Web["comp_web_app"]
      App[App.tsx]
      Login[LoginPage.tsx]
      Home[HomePage.tsx]
      Require[RequireAuth.tsx]
      Ctx[AuthContext.tsx]
      Validate[validateLoginForm.ts]
      Client[apiClient.ts]
    end
    subgraph Api["comp_calorie_tracker_api"]
      Routes[routes/auth.ts]
      AppTs[app.ts]
      Pass[lib/password.ts]
      Sess[lib/session.ts]
      Prisma[plugins/prisma.ts]
    end
    DB[(PostgreSQL via Prisma)]

    App --> Login
    App --> Require
    Require --> Home
    Login --> Ctx
    Login --> Validate
    Home --> Ctx
    Require --> Ctx
    Ctx --> Client
    Client -->|"fetch /auth/login, /auth/session, /auth/logout (credentials: include)"| Routes
    AppTs --> Routes
    Routes --> Pass
    Routes --> Sess
    Routes --> Prisma
    Prisma --> DB

    classDef touched fill:#f96,color:#000
    class App,Login,Home,Require,Ctx,Validate,Client,Routes,AppTs,Pass,Sess,Prisma touched
  ```
review_focus: |
  In scope: pnpm-workspace scaffolding for `api/` and `web/`, the `User` Prisma model, cookie-session
  login/session/logout routes, and the two prototype screens (Login's five states, the Home shell)
  wired to those routes via an `AuthContext` + `RequireAuth` guard. Out of scope (flag if seen):
  registration/forgot-password functionality, real meal/goal/report data on the Home cards
  (placeholder copy is deliberate, taken from the prototype), and gating Food Diary/Goals/Progress
  routes that don't exist yet. Riskiest area: the login route's ordering of checks (empty-field
  validation must short-circuit before any DB/credential lookup, and the wrong-password and
  no-such-user cases must return the identical `401 invalid_credentials` body so the API never
  reveals whether a username exists) — review the route handler's branch order directly rather
  than just the tests. Also note the session cookie's `SameSite`/`Secure` flags are deliberately
  dev-only for now (see assumptions); don't flag that as a bug, it's an explicit open question.
