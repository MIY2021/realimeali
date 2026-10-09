import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";

const androidRoot = "android/app/src/main/java";
async function findMainActivity(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = await findMainActivity(full);
      if (found) return found;
    } else if (entry.name === "MainActivity.java" || entry.name === "MainActivity.kt") {
      return full;
    }
  }
  return null;
}

const mainPath = await findMainActivity(androidRoot);
if (!mainPath || !mainPath.endsWith(".java")) {
  throw new Error("Could not find generated Java MainActivity for embedded Ocado WebView plugin.");
}
const main = await readFile(mainPath, "utf8");
const packageName = main.match(/^package\s+([\w.]+);/m)?.[1];
if (!packageName) throw new Error("Could not determine Android package name.");
const pluginPath = path.join(path.dirname(mainPath), "OcadoWebViewPlugin.java");
const pluginSource = `package ${packageName};

import android.view.ViewGroup;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.view.Gravity;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONArray;
import org.json.JSONObject;

@CapacitorPlugin(name = "OcadoWebView")
public class OcadoWebViewPlugin extends Plugin {
  private ViewGroup overlayParent;
  private LinearLayout root;
  private WebView browser;
  private LinearLayout toolbar;
  private TextView itemLabel;
  private Button previousButton;
  private Button nextButton;
  private JSONArray items = new JSONArray();
  private int currentIndex = 0;

  @PluginMethod
  public void show(PluginCall call) {
    JSONArray incoming = call.getArray("items");
    int index = call.getInt("index", 0);
    if (incoming == null || incoming.length() == 0) {
      call.reject("No Ocado shopping items supplied");
      return;
    }
    getActivity().runOnUiThread(() -> {
      try {
        items = incoming;
        currentIndex = Math.max(0, Math.min(index, items.length() - 1));
        ensureOverlay();
        updateNavigation();
        attachOverlay();
        browser.loadUrl(currentUrl());
        call.resolve();
      } catch (Exception e) {
        call.reject("Could not open Ocado embedded browser", e);
      }
    });
  }

  @PluginMethod
  public void update(PluginCall call) {
    JSONArray incoming = call.getArray("items");
    int index = call.getInt("index", 0);
    if (incoming == null || incoming.length() == 0) {
      call.reject("No Ocado shopping items supplied");
      return;
    }
    getActivity().runOnUiThread(() -> {
      try {
        items = incoming;
        currentIndex = Math.max(0, Math.min(index, items.length() - 1));
        if (root == null || root.getParent() == null) {
          ensureOverlay();
          attachOverlay();
          browser.loadUrl(currentUrl());
        } else {
          updateNavigation();
          String url = currentUrl();
          if (!url.equals(browser.getUrl())) browser.loadUrl(url);
        }
        updateNavigation();
        call.resolve();
      } catch (Exception e) {
        call.reject("Could not update Ocado search", e);
      }
    });
  }

  @PluginMethod
  public void hide(PluginCall call) {
    getActivity().runOnUiThread(() -> {
      detachOverlay();
      call.resolve();
    });
  }

  @PluginMethod
  public void goBack(PluginCall call) {
    getActivity().runOnUiThread(() -> {
      if (browser != null && browser.canGoBack()) browser.goBack();
      call.resolve();
    });
  }

  private void ensureOverlay() {
    if (root != null) return;
    root = new LinearLayout(getActivity());
    root.setOrientation(LinearLayout.VERTICAL);
    root.setBackgroundColor(Color.WHITE);

    browser = new WebView(getActivity());
    browser.setBackgroundColor(Color.WHITE);
    WebSettings settings = browser.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setDatabaseEnabled(true);
    settings.setLoadsImagesAutomatically(true);
    settings.setJavaScriptCanOpenWindowsAutomatically(true);
    settings.setSupportMultipleWindows(false);
    settings.setMediaPlaybackRequiresUserGesture(true);
    CookieManager cookies = CookieManager.getInstance();
    cookies.setAcceptCookie(true);
    cookies.setAcceptThirdPartyCookies(browser, true);
    browser.setWebViewClient(new WebViewClient());
    browser.setWebChromeClient(new WebChromeClient());
    root.addView(browser, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));

    toolbar = new LinearLayout(getActivity());
    toolbar.setOrientation(LinearLayout.HORIZONTAL);
    toolbar.setGravity(Gravity.CENTER_VERTICAL);
    toolbar.setPadding(dp(8), dp(8), dp(8), dp(8));
    toolbar.setBackgroundColor(Color.WHITE);
    toolbar.setElevation(dp(8));
    LinearLayout.LayoutParams toolbarParams = new LinearLayout.LayoutParams(
      LinearLayout.LayoutParams.MATCH_PARENT, dp(76)
    );
    root.addView(toolbar, toolbarParams);

    previousButton = makeButton("‹", "Previous item");
    previousButton.setOnClickListener(v -> moveTo(currentIndex - 1));
    toolbar.addView(previousButton, new LinearLayout.LayoutParams(dp(52), LinearLayout.LayoutParams.MATCH_PARENT));

    itemLabel = new TextView(getActivity());
    itemLabel.setTextColor(Color.rgb(35, 35, 35));
    itemLabel.setTextSize(14);
    itemLabel.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
    itemLabel.setGravity(Gravity.CENTER);
    itemLabel.setMaxLines(2);
    toolbar.addView(itemLabel, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT, 1f));

    nextButton = makeButton("›", "Next item");
    nextButton.setOnClickListener(v -> moveTo(currentIndex + 1));
    toolbar.addView(nextButton, new LinearLayout.LayoutParams(dp(52), LinearLayout.LayoutParams.MATCH_PARENT));

    Button checkedButton = makeButton("✓", "Mark item added to Ocado basket");
    checkedButton.setTextSize(18);
    checkedButton.setOnClickListener(v -> toggleCurrentChecked());
    toolbar.addView(checkedButton, new LinearLayout.LayoutParams(dp(48), LinearLayout.LayoutParams.MATCH_PARENT));

    Button closeButton = makeButton("✕", "Close browser");
    closeButton.setOnClickListener(v -> {
      detachOverlay();
      JSObject event = new JSObject();
      event.put("closed", true);
      notifyListeners("closed", event);
    });
    toolbar.addView(closeButton, new LinearLayout.LayoutParams(dp(48), LinearLayout.LayoutParams.MATCH_PARENT));

  }

  private void attachOverlay() {
    if (root == null || root.getParent() != null) return;
    View content = getBridge().getWebView();
    android.view.ViewParent parent = content.getParent();
    if (!(parent instanceof ViewGroup)) throw new IllegalStateException("Could not locate RealiMeali Activity content container");
    overlayParent = (ViewGroup) parent;
    ViewGroup.LayoutParams params = overlayParent.generateLayoutParams(new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, availableOverlayHeight()));
    params.width = ViewGroup.LayoutParams.MATCH_PARENT;
    params.height = availableOverlayHeight();
    overlayParent.addView(root, params);
    root.bringToFront();
  }

  private void detachOverlay() {
    if (root != null && root.getParent() instanceof ViewGroup) ((ViewGroup) root.getParent()).removeView(root);
    JSObject event = new JSObject();
    event.put("closed", true);
    notifyListeners("closed", event);
  }

  private Button makeButton(String label, String description) {
    Button button = new Button(getActivity());
    button.setText(label);
    button.setTextSize(24);
    button.setTextColor(Color.rgb(25, 25, 25));
    button.setContentDescription(description);
    button.setAllCaps(false);
    button.setPadding(0, 0, 0, 0);
    GradientDrawable bg = new GradientDrawable();
    bg.setColor(Color.rgb(245, 184, 46));
    bg.setCornerRadius(dp(14));
    button.setBackground(bg);
    return button;
  }

  private void toggleCurrentChecked() {
    try {
      JSONObject item = items.getJSONObject(currentIndex);
      String id = item.optString("id", "");
      if (id.isEmpty()) return;
      boolean checked = !item.optBoolean("isChecked", false);
      item.put("isChecked", checked);
      updateNavigation();
      JSObject event = new JSObject();
      event.put("id", id);
      event.put("isChecked", checked);
      notifyListeners("itemChecked", event);
    } catch (Exception ignored) {}
  }

  private void moveTo(int index) {
    if (index < 0 || index >= items.length()) return;
    currentIndex = index;
    updateNavigation();
    try { browser.loadUrl(currentUrl()); } catch (Exception ignored) {}
    JSObject event = new JSObject();
    event.put("index", currentIndex);
    notifyListeners("itemChange", event);
  }

  private void updateNavigation() {
    if (itemLabel == null) return;
    try {
      JSONObject item = items.getJSONObject(currentIndex);
      String name = item.optString("name", "Shopping item");
      boolean checked = item.optBoolean("isChecked", false);
      itemLabel.setText((checked ? "✓ " : "🛒 ") + name + "\\n" + (currentIndex + 1) + " of " + items.length());
    } catch (Exception e) {
      itemLabel.setText("Shopping item " + (currentIndex + 1));
    }
    previousButton.setEnabled(currentIndex > 0);
    previousButton.setAlpha(currentIndex > 0 ? 1f : 0.4f);
    nextButton.setEnabled(currentIndex < items.length() - 1);
    nextButton.setAlpha(currentIndex < items.length() - 1 ? 1f : 0.4f);
  }

  private String currentUrl() throws Exception {
    JSONObject item = items.getJSONObject(currentIndex);
    String url = item.optString("url", "");
    if (!url.startsWith("https://www.ocado.com/search?q=")) {
      throw new IllegalArgumentException("Only Ocado search URLs are allowed");
    }
    return url;
  }

  private int availableOverlayHeight() {
    android.util.DisplayMetrics metrics = new android.util.DisplayMetrics();
    getActivity().getWindowManager().getDefaultDisplay().getRealMetrics(metrics);
    // Leave room for RealiMeali bottom navigation beneath this Activity-level overlay.
    return Math.max(dp(300), metrics.heightPixels - dp(150));
  }

  private int dp(int value) {
    return (int) (value * getContext().getResources().getDisplayMetrics().density + 0.5f);
  }

  @Override
  protected void handleOnDestroy() {
    if (browser != null) {
      browser.stopLoading();
      browser.destroy();
      browser = null;
    }
    detachOverlay();
    root = null;
    overlayParent = null;
    super.handleOnDestroy();
  }
}
`;
await writeFile(pluginPath, pluginSource, "utf8");

let updatedMain = main;
if (!updatedMain.includes("OcadoWebViewPlugin.class")) {
  updatedMain = updatedMain.replace(/(import com\.getcapacitor\.BridgeActivity;\s*)/, "$1import " + packageName + ".OcadoWebViewPlugin;\n");
  updatedMain = updatedMain.replace(/(public class MainActivity extends BridgeActivity\s*\{)/, "$1\n    @Override\n    public void onCreate(android.os.Bundle savedInstanceState) {\n        registerPlugin(OcadoWebViewPlugin.class);\n        super.onCreate(savedInstanceState);\n    }");
  if (!updatedMain.includes("OcadoWebViewPlugin.class")) throw new Error("Failed to register OcadoWebViewPlugin in MainActivity.");
  await writeFile(mainPath, updatedMain, "utf8");
}
console.log("Installed in-Activity Ocado WebView overlay with navigator and manual item tick.");
