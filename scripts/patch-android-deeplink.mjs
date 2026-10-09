import { mkdir, readFile, writeFile } from "node:fs/promises";

const manifestPath = "android/app/src/main/AndroidManifest.xml";
let manifest = await readFile(manifestPath, "utf8");

if (!manifest.includes('android:scheme="realimeali"')) {
  const activityStart = manifest.indexOf("<activity");
  const activityEnd = manifest.indexOf("</activity>", activityStart);
  if (activityStart === -1 || activityEnd === -1) {
    throw new Error("Could not find the Android MainActivity in AndroidManifest.xml");
  }

  const deepLinkFilter = `
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="realimeali" android:host="auth" android:pathPrefix="/callback" />
            </intent-filter>
`;
  manifest = manifest.slice(0, activityEnd) + deepLinkFilter + manifest.slice(activityEnd);
  await writeFile(manifestPath, manifest, "utf8");
  console.log("Registered realimeali://auth/callback Android deep link.");
} else {
  console.log("Native auth deep link already registered.");
}

// Custom adaptive launcher icon: warm cream tile with a coral chef's hat.
const res = "android/app/src/main/res";
const foreground = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp"
    android:viewportWidth="108" android:viewportHeight="108">
    <path android:fillColor="#E38165"
        android:pathData="M29,60 C23,57 21,50 25,44 C28,39 34,37 39,40 C38,29 46,21 55,22 C64,22 70,29 70,38 C78,36 85,42 85,50 C85,56 81,60 76,62 L76,70 L32,70 Z"/>
    <path android:fillColor="#E38165"
        android:pathData="M31,72 L77,72 L80,82 C80,85 77,87 74,87 L34,87 C31,87 28,85 29,82 Z"/>
    <path android:fillColor="#FFF7EF"
        android:pathData="M36,59 C31,56 31,50 35,47 C38,44 42,46 44,49 C42,39 48,32 55,32 C62,32 67,38 66,47 C71,44 77,47 77,52 C77,56 74,59 70,60 L70,65 L37,65 Z"/>
</vector>`;
const adaptive = (round = false) => `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>`;
await mkdir(`${res}/drawable`, { recursive: true });
await mkdir(`${res}/mipmap-anydpi-v26`, { recursive: true });
await writeFile(`${res}/drawable/ic_launcher_foreground.xml`, foreground, "utf8");
await writeFile(`${res}/values/ic_launcher_background.xml`,
  `<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="ic_launcher_background">#FFF7EF</color></resources>\n`, "utf8");
await writeFile(`${res}/mipmap-anydpi-v26/ic_launcher.xml`, adaptive(), "utf8");
await writeFile(`${res}/mipmap-anydpi-v26/ic_launcher_round.xml`, adaptive(true), "utf8");
console.log("Installed custom RealiMeali chef hat adaptive launcher icon.");
