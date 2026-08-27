# SGH Dating API

The REST API behind the SGH dating platform. It handles account creation and verification, cookie based sessions, user profiles with a media gallery on Firebase Storage, a relevance ranked discovery search, and transactional email.

A single deployment serves two front ends. The request origin decides which database the request reads from, so Breezeup and Soulmater share the codebase without sharing data.

## Links

| What | Where |
| --- | --- |
| API base URL (production) | https://sgh-dating-api.glitch.me/api |
| API base URL (local) | http://localhost:10000/api |
| Interactive API reference | https://sgh-dating-api.glitch.me/docs |
| OpenAPI document | https://sgh-dating-api.glitch.me/docs/openapi.json |
| Breezeup front end | https://www.breezeup.me |
| Soulmater front end | https://soulmater.vercel.app |
| Repository | https://github.com/marvelmiles/gsh-dating-api |

The docs are served by the API itself, so the local copy lives at http://localhost:10000/docs once the server is up. The server dropdown on that page defaults to whichever host is serving it, so the local docs talk to localhost and the deployed docs talk to production.

## Features

- Password, Google and sandbox sign in behind one endpoint
- HttpOnly access and refresh token cookies with a silent refresh endpoint
- Email verification and password recovery with expiring 4 digit codes
- Profile management with avatar upload and an ordered gallery of up to 6 images and videos
- Discovery search with bio filters, relevance ranking and pagination
- Firebase Storage for all media, with orphaned files cleaned up on replace and delete
- EJS email templates branded per front end
- Origin based database routing for multi tenant hosting
- One shared response envelope and a stable error code for every failure

## Tech stack

Node.js, Express, MongoDB with Mongoose, Firebase Admin for storage, Nodemailer for mail, JSON Web Tokens for sessions, Multer for uploads, and Swagger UI for the reference.

## Getting started

Requirements: Node.js 16 or newer, and a MongoDB instance you can reach, either locally or on Atlas.

```bash
git clone https://github.com/marvelmiles/gsh-dating-api.git
cd gsh-dating-api
npm install
cp .env.example .env
```

Fill in `.env`, then seed the database and start the server.

```bash
npm run seed
npm run dev
```

The API is on http://localhost:10000/api and the reference is on http://localhost:10000/docs.

## Environment variables

Copy `.env.example` to `.env` and fill it in. Nothing is committed, and no value has a production ready default.

| Variable | Required | What it is for |
| --- | --- | --- |
| `PORT` | No | Port the server binds to. Defaults to `10000`. |
| `NODE_ENV` | No | Set to `production` on a deployed environment. Anything else is treated as development. |
| `ENVIRONMENT` | No | Legacy alias for `NODE_ENV`. Either variable flips production mode on. |
| `MONGODB_PROD_URI` | Yes in production | Breezeup production database. |
| `MONGODB_PROD_TEST_URI` | Yes in production | Soulmater production database. |
| `MONGODB_DEV_URI` | Yes in development | Breezeup development database. |
| `MONGODB_DEV_TEST_URI` | Yes in development | Soulmater development database. |
| `JWT_SECRET` | Yes | Signs the access and refresh tokens. Use a long random string. |
| `MAIL_PASSWORD` | Yes | Gmail app password for the Breezeup sender. |
| `MAIL_PASSWORD_OTHER` | Yes | Gmail app password for the Soulmater sender. |
| `FIREBASE_PRIVATE_KEY_ID` | Yes | Service account key id for Firebase Storage. |
| `FIREBASE_PRIVATE_KEY` | Yes | Service account private key. Keep the `\n` escapes and wrap the value in quotes. |
| `SEED_TEST_ACCOUNT_PASSWORD` | No | Password given to every seeded test account. Defaults to `TestUser@123`. |

Which pair of MongoDB URIs is used depends on both the environment and the request origin. Production mode picks the `PROD` pair, a Breezeup origin picks the non `TEST` variable of that pair, and every other origin picks the `TEST` variable.

## Test accounts

`npm run seed` creates all of the accounts below. They are also listed in the API reference under the **Test accounts** tag, where you can sign in as any of them straight from the page.

### Password accounts

Sign in with `POST /api/auth/signin` and a body of `{ "email": "...", "password": "..." }`. All four share the same password, `TestUser@123`, unless you override `SEED_TEST_ACCOUNT_PASSWORD`.

| Email | Username | Password | What it is for |
| --- | --- | --- | --- |
| `demo.user@gsh.dev` | `demo_user` | `TestUser@123` | General integration and happy path testing |
| `demo.female@gsh.dev` | `demo_female` | `TestUser@123` | Discovery, filtering and profile rendering |
| `demo.male@gsh.dev` | `demo_male` | `TestUser@123` | Discovery, filtering and profile rendering |
| `demo.empty@gsh.dev` | `demo_empty` | `TestUser@123` | Empty states, onboarding and profile completion |

Sign in with a username instead by sending `{ "placeholder": "demo_user", "password": "TestUser@123" }`. The `placeholder` field accepts an email or a username, so one input on your form can drive both.

### Provider account

| Email | Username | Sign in body |
| --- | --- | --- |
| `demo.google@gsh.dev` | `demo_google` | `{ "email": "demo.google@gsh.dev", "provider": "google" }` |

Password sign in and password recovery are refused for this account by design, which makes it the account to test that branch against.

### Sandbox accounts

Eighty generated profiles with full bios, photo and video galleries and rate cards, addressed as `testUser1@sandbox.com` through `testUser80@sandbox.com`. They exist to fill discovery, search and profile screens with realistic data.

```jsonc
{ "email": "testUser7@sandbox.com", "provider": "sandbox" }  // a specific profile
{ "provider": "sandbox" }                                    // a random profile
```

## Seeding

```bash
npm run seed              # create anything missing, leave existing data alone
npm run seed:fresh        # delete every sandbox profile first, then reseed
npm run seed:accounts     # only the named test accounts, skip the 80 sandbox profiles
```

The script is safe to run repeatedly. Named accounts are updated in place rather than duplicated, and sandbox profiles that already exist are skipped. Add `--breeze` to target the Breezeup database and `--prod` to target production, for example `npm run seed -- --breeze --fresh`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Runs the server. |
| `npm run dev` | Runs the server with reload on change. |
| `npm run seed` | Seeds test accounts and sandbox profiles. |
| `npm run seed:fresh` | Replaces the sandbox profiles from scratch. |
| `npm run seed:accounts` | Seeds only the named test accounts. |

## Integrating from a front end

Sessions are cookie based, so there is no token to store and your client must opt into sending credentials on every request.

```js
const apiClient = axios.create({
  baseURL: "http://localhost:10000/api",
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;

    if (error.response?.status !== 401 || request.hasRetried)
      return Promise.reject(error);

    request.hasRetried = true;

    await apiClient.get("/auth/refresh-token");

    return apiClient(request);
  }
);
```

Every response uses the same envelope, so read your payload from `data` and branch on `code` when something fails.

```json
{
  "data": {},
  "code": "REQUEST_OK",
  "success": true,
  "status": 200,
  "statusCode": 200,
  "message": "Request was successful",
  "timestamp": "2026-08-27T09:41:12.804Z"
}
```

Your origin has to be on the allow list in `config/constants.js` before the API will answer it. Add your local origin there if you serve on a port other than 3000.

Outside production the list endpoints delay their response by 3 seconds on purpose, so loading states are easy to build and test. That delay is not present in production.

## Endpoints

Full request and response detail, including every query parameter and error code, lives in the API reference at `/docs`.

| Method | Path | Auth | What it does |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | No | Create an account, optionally with an avatar |
| `POST` | `/api/auth/signin` | No | Sign in and set the session cookies |
| `PATCH` | `/api/auth/signout` | Yes | Clear the session and persist any settings sent |
| `GET` | `/api/auth/refresh-token` | Refresh cookie | Issue a new access token |
| `GET` | `/api/auth/user-exists/{userId}` | No | Check whether an account exists |
| `POST` | `/api/auth/generate-new-token/{reason}` | No | Email a verification code |
| `POST` | `/api/auth/verify-token/{reason}` | No | Verify a code from an email |
| `POST` | `/api/auth/recover-password` | No | Start a password recovery |
| `POST` | `/api/auth/reset-password` | No | Set a new password |
| `GET` | `/api/users` | No | List and search profiles |
| `GET` | `/api/users/{userId}` | No | Read one profile |
| `PUT` | `/api/users/{userId}` | Yes | Update a profile and its avatar |
| `PUT` | `/api/users/update-profile-cover/{userId}` | Yes | Manage the profile cover gallery |
| `GET` | `/api/search` | No | Search across resources |
| `POST` | `/api/feedback` | No | Send a message to support |

## Architecture

```
index.js                 Express app, middleware chain and route mounting
config/
  env.js                 Loads .env once, before anything reads process.env
  constants.js           Origins, error codes, cookie and session policy
  db.js                  Per tenant connection cache and model registry
  firebase.js            Firebase Admin bootstrap and storage handle
  data/
    testAccounts.js      Named test accounts, shared by the seed script and the docs
    testUsers.js         Generated sandbox profiles
    largeData.js         Countries, cities, languages and eye colours
routers/                 Route definitions and per route middleware
controllers/             Request handling and orchestration
models/                  Mongoose schemas, validators and virtuals
utils/                   Auth, uploads, mail, search serialization, validation, errors
templates/               EJS email templates
docs/                    OpenAPI document, assembled from small modules
scripts/seed.js          Database seeding
```

Requests flow through a fixed chain. `selectDatabase` reads the origin, resolves the tenant and attaches the right models to the request, so controllers never import a model directly. `verifyJWToken` reads the access token cookie, `findUser` loads the target account, and `uploadFile` streams any media to Firebase before the controller runs. Everything a controller returns goes through `createSuccessBody`, and everything it throws lands in `errHandler`, which normalises Mongoose, Multer and network failures into the shared error envelope and deletes any file that was uploaded during a request that then failed.

The OpenAPI document is assembled at request time rather than written by hand as a static file, which keeps the server list, the test account tables and the sign in examples generated from the same modules the seed script uses. There is one source of truth for a test account, and it feeds the database, the docs and the README.

## Deployment

The production instance runs on Glitch at https://sgh-dating-api.glitch.me. Any Node host works.

1. Set every variable from the table above in the host's environment, with `NODE_ENV=production`.
2. Point `MONGODB_PROD_URI` and `MONGODB_PROD_TEST_URI` at the production clusters and allow the host's egress addresses through the database firewall.
3. Add the deployed front end origins to `allowedOrigins` in `config/constants.js`.
4. Deploy and run `npm start`. The build step is `npm install`.
5. Seed the production test accounts once, if you want them there, with `npm run seed -- --prod`.

Session cookies are issued with `Secure` and `SameSite=None`, so the API and the front end must both be served over HTTPS in production. The app trusts one proxy hop, which is what Glitch and most platform hosts put in front of it.
