import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShoppingListItem as ShoppingListItemType } from "@/types/shoppingList";
import { getShoppingSearchName } from "@/utils/shoppingIngredientUtils";

interface SainsburysShoppingModeProps {
  items: ShoppingListItemType[];
  selectedItemId: string;
  onSelectItem: (itemId: string) => void;
  onClose: () => void;
}

const SAINSBURYS_SEARCH_URL = "https://www.sainsburys.co.uk/gol-ui/groceries/search";

export default function SainsburysShoppingMode({
  items,
  selectedItemId,
  onSelectItem,
  onClose,
}: SainsburysShoppingModeProps) {
  const currentIndex = Math.max(0, items.findIndex(item => item.id === selectedItemId));
  const selectedItem = items[currentIndex];

  if (!selectedItem) return null;

  const searchName = getShoppingSearchName(
    selectedItem.name,
    selectedItem.consolidatedQuantity ?? selectedItem.quantity,
    selectedItem.consolidatedUnit || selectedItem.unit,
  );
  const sainsburysUrl = SAINSBURYS_SEARCH_URL + "?q=" + encodeURIComponent(searchName);

  const goPrevious = () => {
    if (currentIndex > 0) onSelectItem(items[currentIndex - 1].id);
  };

  const goNext = () => {
    if (currentIndex < items.length - 1) onSelectItem(items[currentIndex + 1].id);
  };

  return (
    <div className="fixed inset-x-0 top-0 bottom-16 md:bottom-0 z-40 bg-background">
      <div className="absolute inset-0 bottom-20 bg-muted/20">
        <iframe
          key={selectedItem.id}
          src={sainsburysUrl}
          title={"Sainsbury's search for " + searchName}
          className="h-full w-full border-0"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-40 min-h-20 border-t-2 border-border bg-card shadow-[0_-8px_24px_rgba(0,0,0,0.18)]">
        <div className="mx-auto flex min-h-20 max-w-3xl items-center gap-2 px-3 py-2">
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
            <div className="truncate text-base font-semibold text-foreground">
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
            href={sainsburysUrl}
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
            aria-label="Close Sainsbury's shopping mode"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
