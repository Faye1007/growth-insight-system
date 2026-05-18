"use client";

import { Trash2 } from "lucide-react";

export function ClearDataSubmitButton() {
  return (
    <button
      className="quiet-button settings-account-action-button text-sm"
      type="submit"
      onClick={(event) => {
        if (!window.confirm("确定要清除账号内所有数据吗？账号会保留，但数据无法恢复。")) {
          event.preventDefault();
        }
      }}
    >
      <Trash2 aria-hidden="true" className="h-4 w-4" />
      清除数据
    </button>
  );
}
