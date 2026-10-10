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
     * Apply the real top/side system-bar and display-cutout inset to the
     * Capacitor WebView once. Keep bottom inset behavior unchanged because
     * the app already owns bottom navigation and safe-area layout.
     */
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        final View webView = getBridge().getWebView();
        final int initialLeft = webView.getPaddingLeft();
        final int initialTop = webView.getPaddingTop();
        final int initialRight = webView.getPaddingRight();
        final int initialBottom = webView.getPaddingBottom();

        ViewCompat.setOnApplyWindowInsetsListener(webView, (view, windowInsets) -> {
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
        ViewCompat.requestApplyInsets(webView);
    }

    private static final String RealiMealiWindowInsets = "webview-top-inset-once";
`;

const classEnd = source.lastIndexOf("}");
if (classEnd < 0) throw new Error("Could not find end of MainActivity class.");
source = source.slice(0, classEnd) + method + "\n" + source.slice(classEnd);
await writeFile(mainPath, source, "utf8");
console.log("Installed app-wide native top/side system-bar inset handling.");
