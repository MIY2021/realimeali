
import { ShoppingListQueries } from "./shoppingListService/shoppingListQueries";
import { ShoppingListMutations } from "./shoppingListService/shoppingListMutations";

export class ShoppingListService {
  // Query methods
  static loadExistingShoppingList = ShoppingListQueries.loadExistingShoppingList;
  static checkDatabaseForItems = ShoppingListQueries.checkDatabaseForItems;
  static clearAll = ShoppingListQueries.clearAll;

  // Mutation methods
  static toggleItemChecked = ShoppingListMutations.toggleItemChecked;
  static addCustomItem = ShoppingListMutations.addCustomItem;
  static addConsolidatedItem = ShoppingListMutations.addConsolidatedItem;
  static updateItem = ShoppingListMutations.updateItem;
  static removeItem = ShoppingListMutations.removeItem;
}
