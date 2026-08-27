export const gettingStartedDescription = `
The REST API behind the SGH dating platform. It covers account creation, cookie based sessions, profile management, media galleries on Firebase and a relevance ranked discovery search.

## Base URL

Every path on this page is prefixed with \`/api\`. Pick your environment from the **Servers** dropdown above. It defaults to the host serving this page, so these docs on localhost talk to localhost and the deployed docs talk to production.

| Environment | Base URL |
| --- | --- |
| Local | \`http://localhost:10000/api\` |
| Production | \`https://sgh-dating-api.glitch.me/api\` |

## Response envelope

Every response, success or failure, arrives in the same envelope. Read your payload from \`data\` and never from the root.

\`\`\`json
{
  "data": { "id": "66c9f0b1a4d2e51f3c7b8a10", "username": "demo_user" },
  "code": "REQUEST_OK",
  "success": true,
  "status": 200,
  "statusCode": 200,
  "message": "Request was successful",
  "timestamp": "2026-08-27T09:41:12.804Z"
}
\`\`\`

Failures keep the same shape with \`success: false\`, a human readable \`message\` you can show directly, and a stable \`code\` you should branch on.

\`\`\`json
{
  "message": "Email or password is incorrect",
  "code": "INVALID_USER_ACCOUNT",
  "success": false,
  "status": 400,
  "statusCode": 400,
  "timestamp": "2026-08-27T09:41:12.804Z"
}
\`\`\`

## Sessions

Authentication is cookie based, not header based. \`POST /api/auth/signin\` sets two \`HttpOnly\` cookies: \`access_token\` and \`refresh_token\`. There is no bearer token to store, and no token is ever exposed to JavaScript.

Because the cookies are issued with \`SameSite=None; Secure\`, **your client must opt into sending them on every request**.

\`\`\`js
const apiClient = axios.create({
  baseURL: "http://localhost:10000/api",
  withCredentials: true,
});
\`\`\`

\`\`\`js
await fetch("http://localhost:10000/api/users", { credentials: "include" });
\`\`\`

Cookie lifetimes depend on the \`rememberMe\` query parameter you pass at sign in.

| Cookie | Default | With \`rememberMe=true\` |
| --- | --- | --- |
| \`access_token\` | 1 hour | 24 hours |
| \`refresh_token\` | 1 day | 28 days |

### Handling expiry

When any endpoint answers **401**, call \`GET /api/auth/refresh-token\` once and retry the original request. When the refresh call itself answers **403**, the session is truly over and the user has to sign in again. An interceptor is the cleanest place for this.

\`\`\`js
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
\`\`\`

## Origins and CORS

Only allow listed origins may call the API, and the origin also selects which database the request reads from. Requests from a Breezeup origin hit one database and every other origin hits the Soulmater database, so a profile created from one front end is not visible from the other. Add your local origin to \`allowedOrigins\` in \`config/constants.js\` if you are serving on a port other than 3000.

## Error codes

| Code | Status | What it means and what to do |
| --- | --- | --- |
| \`INVALID_USER_ACCOUNT\` | 400 | Wrong credentials, or the email or username is already taken during signup. Show the message on the form. |
| \`ValidationError\` | 400 | A field failed schema validation. The message names the field. |
| \`SCHEMA_ERROR\` | 400 | A uniqueness constraint was violated at the database level. |
| \`VERIFICATION_CODE_EXPIRED\` | 400 | The 4 digit code is past its 25 minute window. Offer to resend rather than retry. |
| \`BAD_REQUEST\` | 400 | A required field is missing or malformed. |
| \`UNAUTHORIZED_ACCESS\` | 401 | No access token, or it expired. Refresh once and retry. |
| \`UNAUTHORIZE_ACCESS\` | 403 | The action is not allowed for this account, typically a password action on a federated account. |
| \`FORBIDDEN_ACCESSS\` | 403 | The refresh token expired too. Send the user back to sign in. |
| \`UNVERIFIED_EMAIL\` | 403 or 428 | The signup email was never verified. Route the user to the verification screen. |
| \`LIMIT_UNEXPECTED_FILE\` | 400 | The multipart field name is wrong or too many files were sent. |
| \`_MAIL_ERROR\` | 503 | The mail transport failed. The code was not sent, so let the user retry. |
| \`INTERNAL_SERVER_ERROR\` | 500 | Unexpected server failure. Safe to retry. |

## Pagination

Every list endpoint returns the page alongside its counts, so you can render a pager without a second call.

\`\`\`json
{
  "totalDocs": 84,
  "totalPages": 9,
  "currentPage": 1,
  "data": []
}
\`\`\`

Page size defaults to 10. Pass \`limit=all\` to fetch every match in one response, which is only sensible for small collections.

## A note on local timing

Outside production the list endpoints deliberately delay their response by 3 seconds so loading states are easy to see and test. That delay is absent in production.

## Uploads

Media goes straight to Firebase Storage and the API stores only the public URL. Uploads are sent as \`multipart/form-data\`. The avatar field is named \`avatar\` and the gallery field is named \`profileCover\`. Images and videos are accepted for the gallery, images only for the avatar. Replacing an existing file deletes the old one from storage once the new one is committed.
`;
