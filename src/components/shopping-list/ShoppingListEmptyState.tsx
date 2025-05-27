
import { Card, CardContent } from "@/components/ui/card";

interface ShoppingListEmptyStateProps {
  weekNumber: number;
  hasMealPlans: boolean;
}

export default function ShoppingListEmptyState({
  weekNumber,
  hasMealPlans
}: ShoppingListEmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <p className="text-muted-foreground mb-4">
          {hasMealPlans 
            ? `No shopping list generated yet for week ${weekNumber}.`
            : `No meal plans found for week ${weekNumber}.`
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
