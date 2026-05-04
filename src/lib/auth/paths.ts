export const loginRequiredMessage = "login_required";

export function getSafeNextPath(next?: FormDataEntryValue | string | null) {
  const value = typeof next === "string" ? next.trim() : "";

  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/";
  }

  if (/[\u0000-\u001F\u007F]/.test(value)) {
    return "/";
  }

  return value;
}

type LoginPathOptions = {
  next?: FormDataEntryValue | string | null;
  mode?: "login" | "signup";
  message?: string;
  error?: string;
};

export function buildLoginPath({ next, mode, message, error }: LoginPathOptions = {}) {
  const params = new URLSearchParams();

  if (mode) {
    params.set("mode", mode);
  }

  params.set("next", getSafeNextPath(next));

  if (message) {
    params.set("message", message);
  }

  if (error) {
    params.set("error", error);
  }

  return `/login?${params.toString()}`;
}
