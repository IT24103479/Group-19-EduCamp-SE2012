// src/lib/auth.ts
export const getAuthHeadersFromResponse = (res?: any) => {
  const token =
    res?.token ??
    res?.data?.token ??
    res?.accessToken ??
    res?.data?.accessToken ??
    res?.authToken ??
    null;

  return token ? { Authorization: `Bearer ${token}` } : undefined;
};