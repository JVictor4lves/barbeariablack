export const DASHBOARD_COOKIE_NAME = "bb_dashboard_session";
export const DASHBOARD_SESSION_MAX_AGE = 60 * 60 * 8;

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export async function verifyDashboardPassword(password: string) {
  const expectedPassword = process.env.DASHBOARD_PASSWORD;
  if (!expectedPassword || !password || password.length > 128) return false;
  return constantTimeEqual(password, expectedPassword);
}

export async function issueDashboardSessionToken() {
  const token = process.env.DASHBOARD_SESSION_TOKEN;
  if (!token) throw new Error("A autenticação do painel ainda não foi configurada.");
  return token;
}

export async function isDashboardSessionValid(token?: string | null) {
  if (!token) return false;
  const expectedToken = process.env.DASHBOARD_SESSION_TOKEN;
  return expectedToken ? constantTimeEqual(token, expectedToken) : false;
}

export async function isDashboardRequestAuthenticated(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${DASHBOARD_COOKIE_NAME}=`));
  const encodedToken = sessionCookie?.slice(DASHBOARD_COOKIE_NAME.length + 1);
  const token = encodedToken ? decodeURIComponent(encodedToken) : undefined;
  return isDashboardSessionValid(token);
}

export function dashboardSessionCookie(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${DASHBOARD_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=${DASHBOARD_SESSION_MAX_AGE}`;
}

export function clearDashboardSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${DASHBOARD_COOKIE_NAME}=; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=0`;
}
