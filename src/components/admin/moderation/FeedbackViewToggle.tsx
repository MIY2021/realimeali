
import { Button } from "@/components/ui/button";
import { LayoutList, Table2 } from "lucide-react";

interface FeedbackViewToggleProps {
  currentView: 'table' | 'cards';
  onViewChange: (view: 'table' | 'cards') => void;
}

export function FeedbackViewToggle({ currentView, onViewChange }: FeedbackViewToggleProps) {
  return (
    <div className="flex items-center gap-1 border rounded-lg p-1">
      <Button
        variant={currentView === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className="h-8 px-3"
      >
        <Table2 className="h-4 w-4 mr-1" />
        Table
      </Button>
      <Button
        variant={currentView === 'cards' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('cards')}
        className="h-8 px-3"
      >
        <LayoutList className="h-4 w-4 mr-1" />
        Cards
      </Button>
    </div>
  );
}
