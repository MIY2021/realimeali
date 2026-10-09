import { ChevronLeft, ChevronRight, ExternalLink, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShoppingListItem as ShoppingListItemType } from "@/types/shoppingList";
import { getShoppingSearchName } from "@/utils/shoppingIngredientUtils";

interface OcadoShoppingModeProps {
  items: ShoppingListItemType[];
  selectedItemId: string;
  onSelectItem: (itemId: string) => void;
  onClose: () => void;
}

const OCADO_SEARCH_URL = "https://www.ocado.com/search";

export default function OcadoShoppingMode({
  items,
  selectedItemId,
  onSelectItem,
  onClose,
}: OcadoShoppingModeProps) {
  const currentIndex = items.findIndex(item => item.id === selectedItemId);
  const selectedItem = items[currentIndex];

  if (!selectedItem) return null;

  const searchName = getShoppingSearchName(
    selectedItem.name,
    selectedItem.consolidatedQuantity ?? selectedItem.quantity,
    selectedItem.consolidatedUnit || selectedItem.unit,
  );
  const ocadoUrl = OCADO_SEARCH_URL + "?q=" + encodeURIComponent(searchName);

  const goPrevious = () => {
    if (currentIndex > 0) onSelectItem(items[currentIndex - 1].id);
  };

  const goNext = () => {
    if (currentIndex < items.length - 1) onSelectItem(items[currentIndex + 1].id);
  };

  const openOcado = () => {
    // Open directly from the user's click so mobile browsers do not treat it as a popup.
    window.open(ocadoUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      className="fixed inset-x-0 top-0 bottom-16 z-40 flex flex-col bg-background md:bottom-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ocado-shopping-title"
    >
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5B82E]/20">
          <ShoppingCart className="h-8 w-8 text-foreground" aria-hidden="true" />
        </div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          Item {currentIndex + 1} of {items.length}
        </p>
        <h2 id="ocado-shopping-title" className="mb-2 max-w-lg text-2xl font-semibold text-foreground">
          Find {selectedItem.name} on Ocado
        </h2>
        <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Search Ocado for this item, choose the product and add it to your Ocado basket. RealiMeali cannot add products to your basket automatically.
        </p>
        <Button
          type="button"
          onClick={openOcado}
          className="h-12 gap-2 rounded-xl bg-[#F5B82E] px-6 font-semibold text-black hover:bg-[#e9aa20]"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Search Ocado
        </Button>
        <p className="mt-3 max-w-sm text-xs text-muted-foreground">
          Ocado does not allow its shop pages to be embedded here, so the search opens in a new tab.
        </p>
      </div>

      <div className="shrink-0 border-t border-border bg-card pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_24px_rgba(0,0,0,0.12)]">
        <div className="mx-auto flex min-h-20 max-w-3xl items-center gap-2 px-3 py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={goPrevious}
            disabled={currentIndex === 0}
            className="h-10 w-10 shrink-0 rounded-full p-0"
            aria-label="Previous shopping item"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="min-w-0 flex-1 text-center">
            <div className="truncate text-base font-semibold text-foreground">
              🛒 {selectedItem.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {currentIndex + 1} of {items.length}
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={goNext}
            disabled={currentIndex === items.length - 1}
            className="h-10 w-10 shrink-0 rounded-full p-0"
            aria-label="Next shopping item"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 shrink-0 rounded-full p-0"
            aria-label="Close Ocado shopping mode"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
