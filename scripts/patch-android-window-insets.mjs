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
import android.graphics.Color;
import android.view.View;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
`;
const packageEnd = source.indexOf(";", source.indexOf("package "));
if (packageEnd < 0) throw new Error("Could not find package declaration in MainActivity.java.");
source = source.slice(0, packageEnd + 1) + "\n" + imports + source.slice(packageEnd + 1);

const onCreate = /(@Override\s+public void onCreate\([^)]*\)\s*\{[\s\S]*?super\.onCreate\([^)]*\);)/;
if (!onCreate.test(source)) {
  throw new Error("Could not find MainActivity.onCreate() installed by the Ocado patch.");
}
source = source.replace(onCreate, "$1\n        installRealiMealiWindowInsets();");

const method = `
    /**
     * Apply Android's actual status-bar and display-cutout insets once at the
     * shared Activity content root. Both the app WebView and native Ocado
     * overlay are children of this root, so both stay clear of the camera area.
     */
    private void installRealiMealiWindowInsets() {
        // RealiMealiWindowInsets
        final View content = findViewById(android.R.id.content);
        if (content == null) return;

        // Warm RealiMeali cream behind the transparent Android status bar.
        content.setBackgroundColor(Color.parseColor("#FFF7EF"));
        WindowInsetsControllerCompat controller =
            new WindowInsetsControllerCompat(getWindow(), content);
        controller.setAppearanceLightStatusBars(true);

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

`;
const classEnd = source.lastIndexOf("}");
if (classEnd < 0) throw new Error("Could not find end of MainActivity class.");
source = source.slice(0, classEnd) + method + source.slice(classEnd);

await writeFile(mainPath, source, "utf8");
console.log("Installed app-wide native top/side system-bar inset handling.");
