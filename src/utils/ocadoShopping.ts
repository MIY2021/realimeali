const OCADO_SEARCH_URL = "https://www.ocado.com/search";

export function openOcadoSearch(itemName: string): boolean {
  const query = itemName.trim();
  if (!query) return false;

  const url = `${OCADO_SEARCH_URL}?q=${encodeURIComponent(query)}`;
  const opened = window.open(url, "_blank", "noopener,noreferrer");

  if (opened) {
    opened.opener = null;
    return true;
  }

  // Some mobile browsers/PWAs block window.open unless it is treated as a
  // direct user action. Fall back to normal navigation in a new tab.
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.click();

  return true;
}
