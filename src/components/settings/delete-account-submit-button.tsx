"use client";

import { UserX } from "lucide-react";

export function DeleteAccountSubmitButton() {
  return (
    <button
      className="quiet-button settings-account-action-button text-sm"
      style={{ color: "var(--clay)", borderColor: "var(--clay)" }}
      type="submit"
      onClick={(event) => {
        if (!window.confirm("确定要注销账号吗？此操作不可撤销。")) {
          event.preventDefault();
        }
      }}
    >
      <UserX aria-hidden="true" className="h-4 w-4" />
      注销账号
    </button>
  );
}
