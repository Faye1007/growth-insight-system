"use client";

export function DeleteAccountSubmitButton() {
  return (
    <button
      className="quiet-button text-sm"
      style={{ color: "var(--clay)", borderColor: "var(--clay)" }}
      type="submit"
      onClick={(event) => {
        if (!window.confirm("确定要注销账号吗？此操作不可撤销。")) {
          event.preventDefault();
        }
      }}
    >
      确认注销账号
    </button>
  );
}
