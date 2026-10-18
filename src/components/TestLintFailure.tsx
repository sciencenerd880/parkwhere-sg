import { useState } from "react";

export function TestLintFailure({ shouldCheck }: { shouldCheck: boolean }) {
  if (shouldCheck) {
    // Intentional ESLint error: React Hook called conditionally
    const [count] = useState(0);
    return <div>{count}</div>;
  }
  return <div>No check</div>;
}
