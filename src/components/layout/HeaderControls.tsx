import { ReactNode } from "react";

interface HeaderControlsProps {
  weekControl: ReactNode;
  primaryAction: ReactNode;
  utilityActions?: ReactNode;
  layoutToggle?: ReactNode;
}

export function HeaderControls({ 
  weekControl, 
  primaryAction, 
  utilityActions,
  layoutToggle 
}: HeaderControlsProps) {
  return (
    <div className="space-y-3">
      {/* Row 1: Week selector and primary action on same row */}
      <div className="flex gap-2 items-center">
        {weekControl}
        <div className="flex-1">
          {primaryAction}
        </div>
      </div>

      {/* Row 2: Utility actions and layout toggle */}
      {(utilityActions || layoutToggle) && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex items-center gap-2 flex-shrink-0">
            {utilityActions}
          </div>
          {layoutToggle && (
            <>
              <div className="flex-1" />
              {layoutToggle}
            </>
          )}
        </div>
      )}
    </div>
  );
}
