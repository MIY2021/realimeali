
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
  const { joinRequests, approveJoinRequest, rejectJoinRequest, currentHousehold } = useHousehold();
  const [requestsWithUsers, setRequestsWithUsers] = useState<JoinRequestWithUser[]>([]);

  // Add debug logging
  console.log("JoinRequestsCard - isOwner:", isOwner);
  console.log("JoinRequestsCard - joinRequests:", joinRequests);
  console.log("JoinRequestsCard - currentHousehold:", currentHousehold);

  useEffect(() => {
    const fetchUserNames = async () => {
      console.log("Fetching user names for requests:", joinRequests);
      
      const requestsWithUserData = await Promise.all(
        joinRequests.map(async (request) => {
          try {
            // For privacy reasons, we'll just show a generic user identifier
            // since we can't access other users' auth metadata
            return {
              ...request,
              user_name: `User requesting to join`
            };
          } catch (error) {
            console.error('Error processing user data:', error);
            return {
              ...request,
              user_name: 'Unknown User'
            };
          }
        })
      );
      
      console.log("Requests with user data:", requestsWithUserData);
      setRequestsWithUsers(requestsWithUserData);
    };

    if (joinRequests.length > 0) {
      fetchUserNames();
    } else {
      setRequestsWithUsers([]);
    }
  }, [joinRequests]);

  // Force refresh join requests when component mounts if we're the owner
  useEffect(() => {
    if (isOwner && currentHousehold) {
      console.log("Force refreshing join requests for household:", currentHousehold.id);
      // We need to call fetchJoinRequests from the context
    }
  }, [isOwner, currentHousehold]);

  console.log("Final render - requestsWithUsers:", requestsWithUsers);

  if (!isOwner) {
    console.log("Not owner, not showing join requests card");
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Join Requests ({requestsWithUsers.length})
        </CardTitle>
        <CardDescription>
          Users requesting to join your household.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {requestsWithUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending join requests.</p>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};
