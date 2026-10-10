import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";

const androidRoot = "android/app/src/main/java";

async function findMainActivity(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = await findMainActivity(full);
      if (found) return found;
    } else if (entry.name === "MainActivity.java") {
      return full;
    }
  }
  return null;
}

const mainPath = await findMainActivity(androidRoot);
if (!mainPath) throw new Error("Could not find generated Capacitor MainActivity.java.");

let source = await readFile(mainPath, "utf8");
if (source.includes("RealiMealiWindowInsets")) {
  console.log("RealiMeali system-bar inset handling is already installed.");
  process.exit(0);
}

const imports = `
import android.view.View;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
`;
const packageEnd = source.indexOf(";", source.indexOf("package "));
source = source.slice(0, packageEnd + 1) + "\n" + imports + source.slice(packageEnd + 1);

const method = `
    /**
     * Apply system-bar/cutout insets to the shared native content root.
     * This keeps the main WebView and the embedded Ocado overlay below the
     * real status-bar/camera-cutout area without a CSS pixel guess.
     */
    private void installRealiMealiWindowInsets() {
        final View content = findViewById(android.R.id.content);
        if (content == null) return;

        final int initialLeft = content.getPaddingLeft();
        final int initialTop = content.getPaddingTop();
        final int initialRight = content.getPaddingRight();
        final int initialBottom = content.getPaddingBottom();

        ViewCompat.setOnApplyWindowInsetsListener(content, (view, windowInsets) -> {
            Insets safe = windowInsets.getInsets(
                WindowInsetsCompat.Type.statusBars()
                    | WindowInsetsCompat.Type.displayCutout()
            );
            view.setPadding(
                initialLeft + safe.left,
                initialTop + safe.top,
                initialRight + safe.right,
                initialBottom
            );
            return windowInsets;
        });
        ViewCompat.requestApplyInsets(content);
    }

    private static final String RealiMealiWindowInsets = "webview-top-inset-once";
`;

const call = `
        installRealiMealiWindowInsets();
`;


// Insert the installer call into Capacitor's existing onCreate rather than
// declaring a second onCreate override.
// Capacitor's generated MainActivity may inherit onCreate without overriding it.
 // Add a new override only when no existing override is present; otherwise
 // insert the installer call into the existing method body.
const onCreate = /(@Override\\s+public void onCreate\\([^)]*\\)\\s*\\{[\\s\\S]*?super\\.onCreate\\([^)]*\\);)/;
if (onCreate.test(source)) {
  source = source.replace(onCreate, "$1" + call);
} else {
  const classEnd = source.lastIndexOf("}");
  if (classEnd < 0) throw new Error("Could not find end of MainActivity class.");
  const override = `
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        installRealiMealiWindowInsets();
    }

`;
  source = source.slice(0, classEnd) + override + source.slice(classEnd);
}
const classEnd = source.lastIndexOf("}");
if (classEnd < 0) throw new Error("Could not find end of MainActivity class.");
source = source.slice(0, classEnd) + method + "\n" + source.slice(classEnd);
await writeFile(mainPath, source, "utf8");
console.log("Installed app-wide native top/side system-bar inset handling.");
