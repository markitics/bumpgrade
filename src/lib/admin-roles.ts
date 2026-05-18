export type AdminRole = "owner" | "automation";

export type AdminIdentity = {
  role: AdminRole;
  email: string | null;
  userId: string | null;
  name: string;
};

export function roleLabel(role: AdminRole) {
  if (role === "owner") return "Platform owner";
  return "Automation token";
}
