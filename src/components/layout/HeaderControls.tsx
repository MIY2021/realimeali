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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
      {/* Left side: Week selector */}
      <div className="flex items-center flex-shrink-0">
        {weekControl}
      </div>

      {/* Right side: Actions grouped together */}
      <div className="flex items-center gap-2 flex-wrap">
        {primaryAction && (
          <div className="flex-shrink-0">
            {primaryAction}
          </div>
        )}
        {utilityActions && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {utilityActions}
          </div>
        )}
        {layoutToggle && (
          <div className="flex-shrink-0 ml-1">
            {layoutToggle}
          </div>
        )}
        {rightActions && (
          <div className="flex-shrink-0">
            {rightActions}
          </div>
        )}
      </div>
    </div>
  );
}
