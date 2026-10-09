import { Capacitor } from "@capacitor/core";

export const NATIVE_AUTH_CALLBACK_URL = "realimeali://auth/callback";

export function getAuthRedirectUrl(): string {
  return Capacitor.isNativePlatform()
    ? NATIVE_AUTH_CALLBACK_URL
    : window.location.origin;
}
