
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Check, X } from "lucide-react";
import { useHousehold } from "@/contexts/HouseholdContext";

interface JoinRequestsCardProps {
  isOwner: boolean;
}

export const JoinRequestsCard = ({ isOwner }: JoinRequestsCardProps) => {
  const { joinRequests, approveJoinRequest, rejectJoinRequest } = useHousehold();

  if (!isOwner || joinRequests.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Join Requests
        </CardTitle>
        <CardDescription>
          Users requesting to join your household.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {joinRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-terracotta/20 flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-terracotta" />
                </div>
                <div>
                  <p className="font-medium">Join Request</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {request.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => approveJoinRequest(request.id)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => rejectJoinRequest(request.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
