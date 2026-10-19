import { describe, expect, it } from "vitest";
import { signInFailureCode, signInFailureMessage } from "./sign-in-failure";

const q = (s: string) => new URLSearchParams(s);

describe("sign-in failures", () => {
  it("name the cause Supabase or Google sent back", () => {
    expect(signInFailureCode(q("error=server_error&error_code=unexpected_failure&error_description=Unable+to+exchange+external+code%3A+4%2F0Ab"))).toBe("google_exchange_failed");
    expect(signInFailureCode(q("error=access_denied&error_description=User+cancelled"))).toBe("access_denied");
    expect(signInFailureCode(q("error=access_denied&error_code=otp_expired"))).toBe("otp_expired");
    expect(signInFailureCode(q("code=abc"), { code: "bad_code_verifier" })).toBe("bad_code_verifier");
    expect(signInFailureCode(q("code=abc"), {})).toBe("exchange_failed");
    expect(signInFailureCode(q(""))).toBe("no_code");
  });

  it("keep only letters, digits and underscores", () => {
    expect(signInFailureCode(q("error=<script>alert(1)</script>"))).toBe("scriptalert1script");
    expect(signInFailureMessage("<b>x</b>")).toContain("(bx");
    expect(signInFailureCode(q(`error=${"a".repeat(80)}`))).toHaveLength(40);
  });

  it("say what each one means", () => {
    expect(signInFailureMessage("link")).toMatch(/expired or was already used/);
    expect(signInFailureMessage("google_exchange_failed")).toMatch(/couldn't confirm it with Google/);
    expect(signInFailureMessage("flow_state_not_found")).toMatch(/same browser window/);
    expect(signInFailureMessage("something_new")).toBe("Sign-in didn't finish (something_new). Try again, or use your email.");
  });
});
