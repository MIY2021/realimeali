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
    // Ocado is a responsive site. Honour its viewport meta tag from the first
    // layout pass instead of letting WebView begin in its default wide layout
    // and then reflow after the page's scripts/styles initialise.
    settings.setUseWideViewPort(true);
    settings.setLoadWithOverviewMode(false);
    settings.setTextZoom(100);
    settings.setSupportZoom(false);
    settings.setBuiltInZoomControls(false);
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

    // Navigation and manual tick are rendered once by the React row below the WebView.
    // Keeping this native container browser-only prevents duplicate controls and gaps.

  }

  private final View.OnLayoutChangeListener overlayLayoutListener = (v, l, t, r, b, ol, ot, or, ob) -> updateOverlayBounds();

  private void attachOverlay() {
    if (root == null || root.getParent() != null) return;
    View content = getBridge().getWebView();
    android.view.ViewParent parent = content.getParent();
    if (!(parent instanceof ViewGroup)) throw new IllegalStateException("Could not locate RealiMeali Activity content container");
    overlayParent = (ViewGroup) parent;

    // Keep the browser in the same native coordinate space as the app WebView.
    // Recompute its bounds from measured layout dimensions instead of display-height guesses.
    android.widget.FrameLayout.LayoutParams params = new android.widget.FrameLayout.LayoutParams(
      ViewGroup.LayoutParams.MATCH_PARENT, availableOverlayHeight(), Gravity.TOP);
    params.topMargin = content.getTop();
    overlayParent.addView(root, params);
    content.addOnLayoutChangeListener(overlayLayoutListener);
    overlayParent.addOnLayoutChangeListener(overlayLayoutListener);
    if (android.os.Build.VERSION.SDK_INT >= 21) {
      content.setOnApplyWindowInsetsListener((view, insets) -> {
        updateOverlayBounds();
        return insets;
      });
      content.requestApplyInsets();
    }
    root.bringToFront();
    updateOverlayBounds();
  }

  private void updateOverlayBounds() {
    if (root == null || overlayParent == null || root.getParent() == null) return;
    View content = getBridge().getWebView();
    int measuredHeight = content.getHeight();
    if (measuredHeight <= 0) measuredHeight = overlayParent.getHeight();
    if (measuredHeight <= 0) return;
    ViewGroup.LayoutParams raw = root.getLayoutParams();
    if (raw instanceof android.widget.FrameLayout.LayoutParams) {
      android.widget.FrameLayout.LayoutParams params = (android.widget.FrameLayout.LayoutParams) raw;
      params.width = ViewGroup.LayoutParams.MATCH_PARENT;
      params.height = availableOverlayHeight();
      params.gravity = Gravity.TOP;
      params.topMargin = content.getTop();
      params.bottomMargin = 0;
      root.setLayoutParams(params);
    } else {
      raw.width = ViewGroup.LayoutParams.MATCH_PARENT;
      raw.height = availableOverlayHeight();
      root.setLayoutParams(raw);
    }
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
    // Use the actual measured WebView viewport, not the physical display height.
    // The React shopping row is 64dp and the bottom navigation is 64dp. The
    // bottom safe inset is reserved only when this native content view extends
    // into the system navigation area (edge-to-edge); otherwise its height has
    // already been excluded by Android's window layout.
    View content = getBridge().getWebView();
    int availableHeightPx = content.getHeight();
    if (availableHeightPx <= 0 && overlayParent != null) availableHeightPx = overlayParent.getHeight();
    if (availableHeightPx <= 0) return 0;

    int safeBottomPx = 0;
    if (android.os.Build.VERSION.SDK_INT >= 23 && content.getRootWindowInsets() != null) {
      android.view.WindowInsets insets = content.getRootWindowInsets();
      int inset = insets.getSystemWindowInsetBottom();
      // If the app content reaches the bottom of its parent, it is edge-to-edge;
      // in that case the browser must leave room for the gesture/navigation inset.
      if (overlayParent != null && content.getBottom() >= overlayParent.getHeight()) safeBottomPx = inset;
    }
    int reservedBottomPx = dp(128) + safeBottomPx;
    // Ocado intentionally covers the shopping page from the very top, including
    // the otherwise-visible week selector. Keep only the bottom app controls
    // and any required bottom system inset outside the browser.
    return Math.max(0, availableHeightPx - reservedBottomPx);
  }

  private int availableTopInsetPx() {
    View content = getBridge().getWebView();
    if (android.os.Build.VERSION.SDK_INT >= 23 && content.getRootWindowInsets() != null) {
      return Math.max(0, content.getRootWindowInsets().getSystemWindowInsetTop());
    }
    return 0;
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
    View content = getBridge() != null ? getBridge().getWebView() : null;
    if (content != null) content.removeOnLayoutChangeListener(overlayLayoutListener);
    if (overlayParent != null) overlayParent.removeOnLayoutChangeListener(overlayLayoutListener);
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
