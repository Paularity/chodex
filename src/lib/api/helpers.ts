export function createAuthHeaders(token: string, tenantId: string) {
  return {
    Authorization: `Bearer ${token}`,
    "X-Tenant-Id": tenantId,
  };
}

export function createAuthConfig(token: string, tenantId: string) {
  return {
    headers: createAuthHeaders(token, tenantId),
  };
}
