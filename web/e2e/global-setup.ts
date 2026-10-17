import { sweepTestUsers } from "./support";

/** Notes when the run started; the returned teardown removes and reports any test user left behind. */
export default async function globalSetup() {
  const startedAt = new Date().toISOString();
  return async () => {
    const leaked = await sweepTestUsers(startedAt);
    if (leaked.length) throw new Error(`Test users were left behind by: ${leaked.join(", ")} (now deleted).`);
  };
}
