import { useState } from "react";

export function TestLintFailure({ shouldCheck }: { shouldCheck: boolean }) {
  // Fixed: Hook called unconditionally at the top level
  const [count] = useState(0);

  if (shouldCheck) {
    return <div>{count}</div>;
  }
  return <div>No check</div>;
}
