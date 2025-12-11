
import { Card, CardContent } from "@/components/ui/card";

interface ShoppingListEmptyStateProps {
  hasMealPlans: boolean;
}

export default function ShoppingListEmptyState({
  hasMealPlans
}: ShoppingListEmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <p className="text-muted-foreground mb-4">
          {hasMealPlans 
            ? `No shopping list generated yet for this week.`
            : `No meal plans found for this week.`
          }
        </p>
        {!hasMealPlans && (
          <p className="text-sm text-muted-foreground">
            Add some meal plans first to generate a shopping list.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
