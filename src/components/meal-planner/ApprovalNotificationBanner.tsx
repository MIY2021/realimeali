
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Clock } from "lucide-react";
import { useMealPlanApproval, ApprovalRequest } from "@/contexts/MealPlanApprovalContext";

interface ApprovalNotificationBannerProps {
  request: ApprovalRequest;
}

export function ApprovalNotificationBanner({ request }: ApprovalNotificationBannerProps) {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [comments, setComments] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { respondToRequest } = useMealPlanApproval();

  const handleResponse = async (approved: boolean) => {
    setIsLoading(true);
    try {
      await respondToRequest(request.id, approved, comments || undefined);
      setShowResponseForm(false);
      setComments("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50 mb-4">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <div>
              <h3 className="font-medium text-orange-900">
                Meal Plan Approval Request
              </h3>
              <p className="text-sm text-orange-700">
                Meal plan approval requested
                {request.message && (
                  <span className="block mt-1 italic">"{request.message}"</span>
                )}
              </p>
            </div>
          </div>
          
          {!showResponseForm && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowResponseForm(true)}
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                Respond
              </Button>
            </div>
          )}
        </div>

        {showResponseForm && (
          <div className="mt-4 space-y-3">
            <Textarea
              placeholder="Add optional comments..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleResponse(true)}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleResponse(false)}
                disabled={isLoading}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowResponseForm(false);
                  setComments("");
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
