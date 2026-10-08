import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
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
  const currentIndex = Math.max(0, items.findIndex(item => item.id === selectedItemId));
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="min-h-0 flex-1 bg-muted/20">
        <iframe
          key={selectedItem.id}
          src={ocadoUrl}
          title={"Ocado search for " + searchName}
          className="h-full w-full border-0"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      <div className="relative z-10 shrink-0 border-t border-border bg-card shadow-[0_-8px_24px_rgba(0,0,0,0.15)]">

        <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-2">
          <Button
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
            <div className="truncate text-sm font-semibold text-foreground">
              🛒 {selectedItem.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {currentIndex + 1} of {items.length}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={goNext}
            disabled={currentIndex === items.length - 1}
            className="h-10 w-10 shrink-0 rounded-full p-0"
            aria-label="Next shopping item"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <a
            href={ocadoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex"
          >
            <Button variant="ghost" size="sm" className="h-9 gap-1.5">
              <ExternalLink className="h-4 w-4" />
              Open
            </Button>
          </a>

          <Button
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
    </div>
  );
}
