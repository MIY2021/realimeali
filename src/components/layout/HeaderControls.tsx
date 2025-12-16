import { ReactNode } from "react";

interface HeaderControlsProps {
  weekControl: ReactNode;
  primaryAction?: ReactNode;
  utilityActions?: ReactNode;
  layoutToggle?: ReactNode;
  rightActions?: ReactNode;
}

export function HeaderControls({ 
  weekControl, 
  primaryAction, 
  utilityActions,
  layoutToggle,
  rightActions
}: HeaderControlsProps) {
  return (
    <div className="space-y-3">
      {/* Row 1: Week selector and primary action on same row */}
      <div className="flex gap-2 items-center">
        {weekControl}
        {primaryAction && (
          <div className="flex-1">
            {primaryAction}
          </div>
        )}
      </div>

      {/* Row 2: Utility actions and layout toggle */}
      {(utilityActions || layoutToggle || rightActions) && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex items-center gap-2 flex-shrink-0">
            {utilityActions}
          </div>
          {(layoutToggle || rightActions) ? (
            <>
              <div className="flex-1" />
              {layoutToggle}
              {rightActions}
            </>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      )}
    </div>
  );
}
