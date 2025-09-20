import { useCallback } from "react";
import { AdminAccount, SubmitPayload } from "../../../types";

// ✅ Custom hook for API submission
export default function useApiSubmission() {
  const submitAccount = useCallback(
    async (
      payload: SubmitPayload,
      editing: AdminAccount | null
    ): Promise<void> => {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/accounts/${editing.id}` : "/api/accounts";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`API Error: ${response.status}`);
      }
    },
    []
  );

  return { submitAccount };
}
