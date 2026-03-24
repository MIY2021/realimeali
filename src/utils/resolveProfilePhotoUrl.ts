import type { User } from "@supabase/supabase-js";

export type ProfileAvatarFields = {
  avatar_url?: string | null;
  avatar_type?: string | null;
  avatar_data?: string | null;
};

/**
 * Google / OIDC often expose the profile image as `picture`, not `avatar_url`.
 * Supabase may map either into user_metadata depending on provider config.
 */
export function oauthProfilePhotoFromMetadata(
  authUser: User | null | undefined
): string | null {
  const m = authUser?.user_metadata;
  if (!m || typeof m !== "object") return null;
  const candidates = [
    m.avatar_url,
    m.picture,
    (m as { image_url?: string }).image_url,
    (m as { image?: string }).image,
  ];
  for (const raw of candidates) {
    if (typeof raw === "string" && raw.trim()) return raw.trim();
  }
  return null;
}

/** Google-hosted avatars often 403 in browsers unless referrer is stripped. */
export function profileImageReferrerPolicy(
  url: string | undefined | null
): "no-referrer" | undefined {
  if (!url) return undefined;
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("googleusercontent.com") || host.includes("ggpht.com")) {
      return "no-referrer";
    }
  } catch {
    /* invalid URL */
  }
  return undefined;
}

/**
 * URL shown in the UI. Uses profiles.avatar_url when set; for Google accounts
 * falls back to OAuth metadata (`picture`, `avatar_url`, etc.).
 */
export function resolveProfilePhotoUrl(
  profile: ProfileAvatarFields | null | undefined,
  authUser: User | null | undefined
): string | null {
  const fromRow = profile?.avatar_url?.trim();
  if (fromRow) return fromRow;
  if (profile?.avatar_type === "google") {
    const meta = oauthProfilePhotoFromMetadata(authUser);
    if (meta) return meta;
  }
  // Profile query still loading — show OAuth picture if present
  if (!profile) {
    const meta = oauthProfilePhotoFromMetadata(authUser);
    if (meta) return meta;
  }
  return null;
}

export function profilePhotoSourceLabel(
  profile: ProfileAvatarFields | null | undefined
): string {
  const t = profile?.avatar_type;
  if (t === "google") return "From your Google account";
  if (t === "uploaded") return "Your uploaded photo";
  if (profile?.avatar_url?.trim()) return "Profile photo";
  return "";
}
