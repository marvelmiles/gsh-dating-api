import "../config/env";
import { connectToDatabase } from "../config/db";
import testUsers from "../config/data/testUsers";
import {
  TEST_ACCOUNT_PASSWORD,
  credentialTestAccounts,
  providerTestAccounts,
} from "../config/data/testAccounts";

const parseCommandLineOptions = (argv = []) => {
  const flags = new Set(argv.filter((arg) => arg.startsWith("--")));

  return {
    isBreeze: flags.has("--breeze"),
    isProd: flags.has("--prod"),
    shouldReset: flags.has("--fresh"),
    shouldSkipSandbox: flags.has("--accounts-only"),
  };
};

const upsertAccount = async (User, account) => {
  const existing = await User.findOne({ email: account.email });

  if (existing) {
    existing.set(account);

    await existing.save();

    return { email: account.email, action: "updated" };
  }

  await new User(account).save();

  return { email: account.email, action: "created" };
};

const seedNamedAccounts = async (User) => {
  const accounts = [...credentialTestAccounts, ...providerTestAccounts];

  const results = [];

  for (const account of accounts) {
    results.push(await upsertAccount(User, account));
  }

  return results;
};

const seedSandboxAccounts = async (User, shouldReset) => {
  if (shouldReset) await User.deleteMany({ provider: "sandbox" });

  const existingEmails = new Set(
    (await User.find({ provider: "sandbox" }).select("email")).map(
      (user) => user.email
    )
  );

  const pending = testUsers.filter((user) => !existingEmails.has(user.email));

  if (pending.length) await User.insertMany(pending, { ordered: false });

  return { inserted: pending.length, skipped: existingEmails.size };
};

const describeTarget = ({ isBreeze, isProd }) =>
  `${isBreeze ? "breezeup" : "soulmater"} / ${
    isProd ? "production" : "development"
  }`;

const waitForConnection = (db) =>
  new Promise((resolve, reject) => {
    if (db.readyState === 1) return resolve();

    db.once("connected", resolve);
    db.once("error", reject);
  });

const runSeed = async () => {
  const options = parseCommandLineOptions(process.argv.slice(2));

  console.log(`Seeding ${describeTarget(options)}`);

  const { db, models } = connectToDatabase(options);

  await waitForConnection(db);

  const namedAccounts = await seedNamedAccounts(models.User);

  for (const { email, action } of namedAccounts) {
    console.log(`  ${action.padEnd(8)} ${email}`);
  }

  if (options.shouldSkipSandbox) console.log("  skipped  sandbox profiles");
  else {
    const sandbox = await seedSandboxAccounts(models.User, options.shouldReset);

    console.log(
      `  created  ${sandbox.inserted} sandbox profiles (${sandbox.skipped} already present)`
    );
  }

  console.log(`\nPassword for every credential account: ${TEST_ACCOUNT_PASSWORD}`);
  console.log("Full account list: /docs, under the Test accounts tag.");

  await db.close();
};

runSeed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`Seed failed: ${err.message}`);
    process.exit(1);
  });
