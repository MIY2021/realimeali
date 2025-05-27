
interface ShoppingListCreationInfoProps {
  lastGenerated: Date | null;
}

export default function ShoppingListCreationInfo({
  lastGenerated
}: ShoppingListCreationInfoProps) {
  if (!lastGenerated) return null;

  return (
    <div className="mb-3">
      <p className="text-xs text-muted-foreground">
        Shopping list created on {lastGenerated.toLocaleDateString()} at {lastGenerated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
}
