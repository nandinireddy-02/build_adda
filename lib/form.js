// Small helpers for reading form fields safely in server actions.

export function text(formData, name, max = 500) {
  const value = formData.get(name);
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function list(formData, name, allowed) {
  const values = formData.getAll(name).filter((v) => typeof v === "string");
  const unique = [...new Set(values.map((v) => v.trim()).filter(Boolean))];
  return allowed ? unique.filter((v) => allowed.includes(v)) : unique;
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
