import type { APIRequestContext, APIResponse } from "@playwright/test";

export const API_BASE_URL = process.env.E2E_API_URL ?? "http://127.0.0.1:3000";

export async function postJson(request: APIRequestContext, path: string, body: unknown): Promise<APIResponse> {
  return request.post(`${API_BASE_URL}${path}`, { data: body });
}

export async function getJson(request: APIRequestContext, path: string): Promise<APIResponse> {
  return request.get(`${API_BASE_URL}${path}`);
}

export async function login(request: APIRequestContext, email: string, password: string) {
  return postJson(request, "/api/auth/login", { email, password });
}

export async function changePassword(request: APIRequestContext, password: string) {
  return postJson(request, "/api/auth/change-password", { newPassword: password, confirmPassword: password });
}

export async function signInAndChangePassword(request: APIRequestContext, email: string, seedPassword: string, changedPassword: string) {
  const loginResponse = await login(request, email, seedPassword);
  if (!loginResponse.ok()) throw new Error(`Login failed for ${email}: ${loginResponse.status()}`);
  const loginBody = await loginResponse.json() as { data: { user: { mustChangePassword: boolean } } };
  if (loginBody.data.user.mustChangePassword) {
    const changeResponse = await changePassword(request, changedPassword);
    if (!changeResponse.ok()) throw new Error(`Password change failed for ${email}: ${changeResponse.status()}`);
  }
}

export async function errorCode(response: APIResponse) {
  const body = await response.json() as { error?: { code?: string } };
  return body.error?.code;
}
