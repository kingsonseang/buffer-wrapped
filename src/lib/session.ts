import { cookies } from "next/headers";

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("buffer_token");
  return session;
}

export async function setSession(session: string) {
  const cookieStore = await cookies();
  cookieStore.set("buffer_token", session);
}

export async function clearAuthState() {
  const cookieStore = await cookies();
  cookieStore.delete("buffer_oauth_state");
  cookieStore.delete("buffer_code_verifier");
}
