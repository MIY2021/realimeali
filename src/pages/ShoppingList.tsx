
import { useState, useEffect } from "react";
import { ListChecks, Share, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useHouseholdShopping } from "@/contexts/HouseholdShoppingContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import ShoppingListActions from "@/components/ShoppingListActions";

export default function ShoppingList() {
  const { currentHousehold } = useHousehold();
  const { 
    shoppingItems, 
    isLoading, 
    addShoppingItem, 
    updateShoppingItem, 
    deleteShoppingItem,
    generateShoppingListFromMealPlan 
  } = useHouseholdShopping();
  
  const [newItem, setNewItem] = useState("");
  const [newItemQty, setNewItemQty] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const handleToggleItem = async (id: string, checked: boolean) => {
    await updateShoppingItem(id, { is_checked: checked });
    
    if (checked) {
      const item = shoppingItems.find(i => i.id === id);
      toast({
        title: "Item checked",
        description: `${item?.name} marked as purchased`,
      });
    }
  };

  const handleCheckAll = async () => {
    for (const item of shoppingItems) {
      if (!item.is_checked) {
        await updateShoppingItem(item.id, { is_checked: true });
      }
    }
    toast({
      title: "All items checked",
      description: "All ingredients marked as purchased",
    });
  };

  const handleUncheckAll = async () => {
    for (const item of shoppingItems) {
      if (item.is_checked) {
        await updateShoppingItem(item.id, { is_checked: false });
      }
    }
  };

  const handleRemoveAll = async () => {
    if (!window.confirm("Are you sure you want to remove all items from your shopping list?")) {
      return;
    }
    
    for (const item of shoppingItems) {
      await deleteShoppingItem(item.id);
    }
    
    toast({
      title: "List cleared",
      description: "All shopping list items removed",
    });
  };

  const handleAddCustomItem = async () => {
    if (!newItem.trim()) {
      toast({
        title: "Error",
        description: "Please enter an item name",
        variant: "destructive"
      });
      return;
    }
    
    const qty = newItemQty ? parseFloat(newItemQty) : undefined;
    
    await addShoppingItem({
      name: newItem.toLowerCase(),
      quantity: qty,
      unit: newItemUnit,
      category: categoriseByName(newItem),
      is_checked: false,
      is_custom: true,
      recipe_ids: []
    });
    
    toast({
      title: "Item added",
      description: `${newItem} added to shopping list`,
    });
    
    // Reset form
    setNewItem("");
    setNewItemQty("");
    setNewItemUnit("");
  };

  const handleShare = async () => {
    let shareText = `Shopping List for ${currentHousehold?.name}:\n\n`;
    Object.entries(categorisedItems()).forEach(([category, items]) => {
      shareText += `${category}:\n`;
      items.forEach(item => {
        shareText += `- ${item.quantity ? `${item.quantity} ` : ''}${item.unit ? `${item.unit} ` : ''}${item.name}\n`;
      });
      shareText += '\n';
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shopping List',
          text: shareText
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "List copied",
        description: "Shopping list copied to clipboard",
      });
    }
  };

  const confirmRemoveItem = async () => {
    if (itemToDelete) {
      await deleteShoppingItem(itemToDelete);
      toast({
        title: "Item removed",
        description: "Ingredient removed from shopping list",
      });
      setItemToDelete(null);
    }
  };

  const categoriseByName = (name: string): string => {
    const nameLower = name.toLowerCase();
    
    // Fresh & Chilled Food
    if (/lettuce|spinach|kale|rocket|watercress|cabbage|broccoli|cauliflower|carrot|onion|potato|tomato|cucumber|pepper|courgette|aubergine|mushroom|garlic|ginger|lemon|lime|orange|apple|banana|grapes|strawberry|avocado|herbs|parsley|coriander|basil|thyme|rosemary|fresh|salad|vegetable|fruit|meat|chicken|beef|pork|lamb|fish|salmon|cod|prawns|bacon|ham|sausage|mince|steak|milk|cheese|yogurt|cream|butter|egg|tofu/i.test(nameLower)) {
      return "Fresh & Chilled Food";
    }
    
    // Food Cupboard
    if (/flour|sugar|salt|pepper|oil|vinegar|rice|pasta|noodles|quinoa|couscous|bulgur|lentils|beans|chickpeas|tinned|canned|jar|sauce|paste|stock|cube|spice|spices|cumin|paprika|turmeric|cinnamon|vanilla|honey|syrup|nuts|seeds|dried|cereal|oats|biscuits|crackers|tea|coffee|condiment|ketchup|mustard|mayo|mayonnaise|dressing|coconut|tahini|peanut|almond|olive|sunflower|rapeseed|balsamic|soy|worcestershire|tabasco|harissa/i.test(nameLower)) {
      return "Food Cupboard";
    }
    
    // Bakery
    if (/bread|bun|roll|bagel|muffin|croissant|pastry|cake|loaf|baguette|pitta|naan|tortilla|wrap|crumpet|scone/i.test(nameLower)) {
      return "Bakery";
    }
    
    // Frozen Food
    if (/frozen|ice|sorbet|gelato|peas|chips|pizza|ready meal/i.test(nameLower)) {
      return "Frozen Food";
    }
    
    // Dietary, Lifestyle & World Foods
    if (/gluten.free|dairy.free|vegan|organic|free.range|coconut.milk|almond.milk|soy.milk|oat.milk|kimchi|miso|teriyaki|curry|garam.masala|chinese|thai|indian|mexican|mediterranean|kosher|halal/i.test(nameLower)) {
      return "Dietary, Lifestyle & World Foods";
    }
    
    // Soft Drinks, Tea & Coffee
    if (/juice|squash|cordial|water|sparkling|cola|lemonade|energy.drink|smoothie|kombucha|green.tea|black.tea|herbal.tea|coffee.beans|instant.coffee|decaf/i.test(nameLower)) {
      return "Soft Drinks, Tea & Coffee";
    }
    
    // Beer, Wine & Spirits
    if (/beer|wine|whisky|vodka|gin|rum|brandy|champagne|prosecco|cider|ale|lager|spirits|alcohol/i.test(nameLower)) {
      return "Beer, Wine & Spirits";
    }
    
    // Health, Beauty & Personal Care
    if (/shampoo|conditioner|soap|toothpaste|deodorant|moisturiser|sunscreen|vitamins|supplements|paracetamol|ibuprofen|plaster|antiseptic/i.test(nameLower)) {
      return "Health, Beauty & Personal Care";
    }
    
    // Baby, Parent & Kids
    if (/nappy|baby.food|formula|dummy|wipes|baby.oil|baby.powder|kids|children|junior/i.test(nameLower)) {
      return "Baby, Parent & Kids";
    }
    
    // Home Care & Cleaning
    if (/washing.powder|fabric.softener|bleach|disinfectant|toilet.paper|kitchen.roll|bin.bags|washing.up.liquid|dishwasher|tablets|cleaning|polish|hoover|vacuum/i.test(nameLower)) {
      return "Home Care & Cleaning";
    }
    
    // Pets, Home & Garden
    if (/dog.food|cat.food|pet.treats|bird.seed|fish.food|plant.food|compost|seeds|bulbs|garden|pet|animal/i.test(nameLower)) {
      return "Pets, Home & Garden";
    }
    
    // Occasions & Entertaining
    if (/candles|balloons|party|celebration|gift|card|wrapping|decorations|entertaining/i.test(nameLower)) {
      return "Occasions & Entertaining";
    }
    
    // Clothing & Accessories
    if (/socks|underwear|shirt|dress|jumper|jacket|shoes|hat|gloves|scarf|belt|bag|watch|jewellery/i.test(nameLower)) {
      return "Clothing & Accessories";
    }
    
    // Default fallback
    return "Food Cupboard";
  };

  const categorisedItems = () => {
    const categories = [
      "Fresh & Chilled Food",
      "Food Cupboard", 
      "Bakery",
      "Frozen Food",
      "Dietary, Lifestyle & World Foods",
      "Soft Drinks, Tea & Coffee",
      "Beer, Wine & Spirits", 
      "Health, Beauty & Personal Care",
      "Baby, Parent & Kids",
      "Home Care & Cleaning",
      "Pets, Home & Garden",
      "Occasions & Entertaining",
      "Clothing & Accessories"
    ];
    
    const result: Record<string, typeof shoppingItems> = {};
    
    categories.forEach(category => {
      result[category] = shoppingItems.filter(item => item.category === category);
    });
    
    return Object.fromEntries(
      Object.entries(result).filter(([_, items]) => items.length > 0)
    );
  };

  const checkedCount = shoppingItems.filter(i => i.is_checked).length;

  if (!currentHousehold) {
    return (
      <div className="container max-w-3xl py-8">
        <div className="text-center py-10">
          <p className="text-muted-foreground">Please select a household to view shopping lists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <ListChecks className="h-6 w-6" />
              Shopping List
            </h1>
            <p className="text-sm text-muted-foreground">
              Household shopping list for {currentHousehold.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateShoppingListFromMealPlan}
              className="px-2"
              title="Generate from meal plan"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="px-2"
              title="Share shopping list"
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          {shoppingItems.length} items • {checkedCount} purchased
        </p>
        <ShoppingListActions
          onCheckAll={handleCheckAll}
          onUncheckAll={handleUncheckAll}
          onRemoveAll={handleRemoveAll}
        />
        
        {/* Add custom item form */}
        <div className="flex items-center gap-2 mt-4">
          <Input 
            placeholder="Item name" 
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="flex-grow"
          />
          <Input 
            placeholder="Qty" 
            type="number"
            value={newItemQty}
            onChange={(e) => setNewItemQty(e.target.value)}
            className="w-16"
          />
          <Input 
            placeholder="Unit" 
            value={newItemUnit}
            onChange={(e) => setNewItemUnit(e.target.value)}
            className="w-20"
          />
          <Button 
            onClick={handleAddCustomItem} 
            size="icon"
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading shopping list...</p>
        </div>
      ) : shoppingItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No items in your shopping list yet.</p>
          <Button onClick={generateShoppingListFromMealPlan}>
            <Pencil className="h-4 w-4 mr-2" />
            Generate from Meal Plan
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(categorisedItems()).map(([category, items]) => (
            <Card key={category}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className={`flex items-start gap-2 p-2 rounded ${item.is_checked ? 'bg-muted/50' : ''}`}
                    >
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={item.is_checked}
                        onCheckedChange={(checked) => handleToggleItem(item.id, !!checked)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={`item-${item.id}`}
                          className={`text-sm ${item.is_checked ? 'line-through text-muted-foreground' : ''} break-words cursor-pointer`}
                        >
                          {item.quantity && item.unit
                            ? `${item.quantity} ${item.unit} ${item.name}`
                            : item.quantity ? `${item.quantity} ${item.name}` : item.name}
                        </label>
                        {item.is_custom && (
                          <div className="text-xs text-muted-foreground mt-1">Custom item</div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setItemToDelete(item.id)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Confirmation Dialog */}
      <AlertDialog open={itemToDelete !== null} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from your shopping list?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveItem}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
