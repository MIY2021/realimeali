
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Check, X } from "lucide-react";
import { useHousehold } from "@/contexts/HouseholdContext";
import { supabase } from "@/integrations/supabase/client";

interface JoinRequestsCardProps {
  isOwner: boolean;
}

interface JoinRequestWithUser {
  id: string;
  household_id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

export const JoinRequestsCard = ({ isOwner }: JoinRequestsCardProps) => {
  const { joinRequests, approveJoinRequest, rejectJoinRequest } = useHousehold();
  const [requestsWithUsers, setRequestsWithUsers] = useState<JoinRequestWithUser[]>([]);

  useEffect(() => {
    const fetchUserNames = async () => {
      const requestsWithUserData = await Promise.all(
        joinRequests.map(async (request) => {
          try {
            // Try to get user info from the current authenticated user first
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            
            if (currentUser && currentUser.id === request.user_id) {
              return {
                ...request,
                user_name: currentUser.user_metadata?.full_name || currentUser.email || 'Unknown User'
              };
            }

            // For other users, we can't access their metadata directly due to privacy
            // So we'll show a generic identifier
            return {
              ...request,
              user_name: `User ${request.user_id.slice(0, 8)}`
            };
          } catch (error) {
            console.error('Error fetching user data:', error);
            return {
              ...request,
              user_name: 'Unknown User'
            };
          }
        })
      );
      setRequestsWithUsers(requestsWithUserData);
    };

    if (joinRequests.length > 0) {
      fetchUserNames();
    } else {
      setRequestsWithUsers([]);
    }
  }, [joinRequests]);

  if (!isOwner || requestsWithUsers.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Join Requests
        </CardTitle>
        <CardDescription>
          Users requesting to join your household.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requestsWithUsers.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-terracotta/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-terracotta" />
                </div>
                <div>
                  <p className="font-medium">{request.user_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Requested on {new Date(request.created_at).toLocaleDateString()}
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
