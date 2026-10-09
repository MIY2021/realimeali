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

import android.graphics.Color;
import android.graphics.Rect;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "OcadoWebView")
public class OcadoWebViewPlugin extends Plugin {
  private WebView ocadoView;
  private FrameLayout.LayoutParams overlayParams;

  @PluginMethod
  public void show(PluginCall call) {
    String url = call.getString("url");
    if (url == null || !url.startsWith("https://www.ocado.com/")) {
      call.reject("Only secure Ocado URLs are allowed");
      return;
    }
    getActivity().runOnUiThread(() -> {
      try {
        ensureView();
        resizeOverlay();
        ocadoView.setVisibility(View.VISIBLE);
        ocadoView.loadUrl(url);
        JSObject result = new JSObject();
        result.put("visible", true);
        call.resolve(result);
      } catch (Exception e) {
        call.reject("Could not open Ocado inside RealiMeali", e);
      }
    });
  }

  @PluginMethod
  public void navigate(PluginCall call) {
    String url = call.getString("url");
    if (url == null || !url.startsWith("https://www.ocado.com/")) {
      call.reject("Only secure Ocado URLs are allowed");
      return;
    }
    getActivity().runOnUiThread(() -> {
      if (ocadoView == null) {
        call.reject("Ocado browser is not open");
        return;
      }
      ocadoView.loadUrl(url);
      call.resolve();
    });
  }

  @PluginMethod
  public void hide(PluginCall call) {
    getActivity().runOnUiThread(() -> {
      if (ocadoView != null) ocadoView.setVisibility(View.GONE);
      call.resolve();
    });
  }

  @PluginMethod
  public void goBack(PluginCall call) {
    getActivity().runOnUiThread(() -> {
      if (ocadoView != null && ocadoView.canGoBack()) ocadoView.goBack();
      call.resolve();
    });
  }

  private void ensureView() {
    if (ocadoView != null) return;
    View webView = getBridge().getWebView();
    if (!(webView.getParent() instanceof ViewGroup)) {
      throw new IllegalStateException("Could not find the RealiMeali native content container");
    }
    ViewGroup container = (ViewGroup) webView.getParent();
    ocadoView = new WebView(getContext());
    ocadoView.setBackgroundColor(Color.WHITE);
    WebSettings settings = ocadoView.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setDatabaseEnabled(true);
    settings.setLoadsImagesAutomatically(true);
    settings.setJavaScriptCanOpenWindowsAutomatically(true);
    settings.setSupportMultipleWindows(false);
    settings.setMediaPlaybackRequiresUserGesture(true);
    CookieManager cookies = CookieManager.getInstance();
    cookies.setAcceptCookie(true);
    cookies.setAcceptThirdPartyCookies(ocadoView, true);
    ocadoView.setWebViewClient(new WebViewClient());
    ocadoView.setWebChromeClient(new WebChromeClient());
    overlayParams = new FrameLayout.LayoutParams(
      ViewGroup.LayoutParams.MATCH_PARENT, calculateHeight(), Gravity.TOP | Gravity.CENTER_HORIZONTAL
    );
    container.addView(ocadoView, overlayParams);
    ocadoView.setVisibility(View.GONE);
  }

  private int calculateHeight() {
    DisplayMetrics metrics = getContext().getResources().getDisplayMetrics();
    // Leave the RealiMeali item navigator and bottom tab bar visible below the Ocado website.
    return Math.max(1, metrics.heightPixels - (int) (150 * metrics.density));
  }

  private void resizeOverlay() {
    if (ocadoView == null || overlayParams == null) return;
    overlayParams.height = calculateHeight();
    ocadoView.setLayoutParams(overlayParams);
  }

  @Override
  protected void handleOnDestroy() {
    if (ocadoView != null) {
      ViewGroup parent = (ViewGroup) ocadoView.getParent();
      if (parent != null) parent.removeView(ocadoView);
      ocadoView.destroy();
      ocadoView = null;
    }
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
console.log("Installed native embedded Ocado WebView plugin and registered it with Capacitor.");
