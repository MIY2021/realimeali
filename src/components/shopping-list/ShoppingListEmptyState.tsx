
import { Card, CardContent } from "@/components/ui/card";

interface ShoppingListEmptyStateProps {
  hasMealPlans: boolean;
}

export default function ShoppingListEmptyState({
  hasMealPlans
}: ShoppingListEmptyStateProps) {
  // Only show empty state if there are no meal plans
  // If meal plans exist, the list will load/generate silently
  if (hasMealPlans) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6 text-center">
        <p className="text-muted-foreground mb-4">
          No meal plans found for this week.
        </p>
        <p className="text-sm text-muted-foreground">
          Add some meal plans first to generate a shopping list.
        </p>
      </CardContent>
    </Card>
  );
}
