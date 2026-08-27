import {
  SANDBOX_ACCOUNT_TOTAL,
  TEST_ACCOUNT_PASSWORD,
  buildSandboxAccountEmail,
  credentialTestAccounts,
  providerTestAccounts,
} from "../config/data/testAccounts";

const buildMarkdownTable = (headers, rows) =>
  [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");

const credentialRows = credentialTestAccounts.map((account) => [
  `\`${account.email}\``,
  `\`${account.username}\``,
  `\`${TEST_ACCOUNT_PASSWORD}\``,
  account.bio.purpose,
]);

const providerRows = providerTestAccounts.map((account) => [
  `\`${account.email}\``,
  `\`${account.username}\``,
  `\`${account.provider}\``,
  "Federated sign in. Password sign in and password recovery are rejected for this account by design.",
]);

const sandboxRange = `\`${buildSandboxAccountEmail(
  1
)}\` &rarr; \`${buildSandboxAccountEmail(SANDBOX_ACCOUNT_TOTAL)}\``;

export const testAccountsDescription = `
All accounts below are created by \`npm run seed\`. Run it once against your local or staging database before you start integrating.

### Password accounts

Sign in with \`POST /api/auth/signin\` and a body of \`{ "email": "...", "password": "..." }\`. Every password account shares the same password.

${buildMarkdownTable(
  ["Email", "Username", "Password", "What it is for"],
  credentialRows
)}

### Provider accounts

Sign in with \`POST /api/auth/signin\` and a body of \`{ "email": "...", "provider": "google" }\`. No password is involved.

${buildMarkdownTable(
  ["Email", "Username", "Provider", "What it is for"],
  providerRows
)}

### Sandbox accounts

${SANDBOX_ACCOUNT_TOTAL} generated demo profiles with full bios, photo galleries and rate cards. They exist to fill discovery, search and profile screens with realistic data.

${buildMarkdownTable(
  ["Email range", "Provider", "What it is for"],
  [
    [
      sandboxRange,
      "`sandbox`",
      "Populating list, search and profile screens with realistic data",
    ],
  ]
)}

Sign in as a specific sandbox profile with \`{ "email": "${buildSandboxAccountEmail(
  7
)}", "provider": "sandbox" }\`.

Omit the email and send only \`{ "provider": "sandbox" }\` to be signed in as a random sandbox profile, which is handy for demos.

### Signing in from this page

Open **Authentication &rarr; POST /api/auth/signin**, press **Try it out**, then pick any account from the **Examples** dropdown on the request body and press **Execute**. The session cookies are set on the response and every protected endpoint on this page will work for the rest of the browser session.

The base URL used for that request is whichever entry is selected in the **Servers** dropdown at the top of the page. It defaults to the host serving these docs, so opening the docs on localhost talks to localhost.
`;

const buildSignInExample = (summary, description, value) => ({
  summary,
  description,
  value,
});

export const signInExamples = {
  ...credentialTestAccounts.reduce(
    (examples, account) => ({
      ...examples,
      [account.username]: buildSignInExample(
        `${account.bio.fullname} (password account)`,
        account.bio.purpose,
        { email: account.email, password: TEST_ACCOUNT_PASSWORD }
      ),
    }),
    {}
  ),
  ...providerTestAccounts.reduce(
    (examples, account) => ({
      ...examples,
      [account.username]: buildSignInExample(
        `${account.bio.fullname} (${account.provider} provider)`,
        "Federated sign in. The account is created on first use when it does not exist yet.",
        {
          email: account.email,
          username: account.username,
          provider: account.provider,
        }
      ),
    }),
    {}
  ),
  sandboxSpecific: buildSignInExample(
    "A specific sandbox profile",
    `Any address between ${buildSandboxAccountEmail(
      1
    )} and ${buildSandboxAccountEmail(SANDBOX_ACCOUNT_TOTAL)} works.`,
    { email: buildSandboxAccountEmail(7), provider: "sandbox" }
  ),
  sandboxRandom: buildSignInExample(
    "A random sandbox profile",
    "Signs in as any one of the generated demo profiles. Useful for demo builds and screenshots.",
    { provider: "sandbox" }
  ),
  usernameSignIn: buildSignInExample(
    "Sign in with a username instead of an email",
    "The placeholder field accepts an email or a username, so a single input on your sign in form can drive both.",
    { placeholder: "demo_user", password: TEST_ACCOUNT_PASSWORD }
  ),
};
