import { readFile, writeFile } from "node:fs/promises";

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
