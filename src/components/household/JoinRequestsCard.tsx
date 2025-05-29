
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Check, X } from "lucide-react";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { HouseholdJoinRequest } from "@/types";

interface JoinRequestsCardProps {
  isOwner: boolean;
}

const JoinRequestUserCard = ({ request }: { request: HouseholdJoinRequest }) => {
  const { profile, isLoading } = useUserProfile(request.userId);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error(`Avatar image failed to load for join request user ${request.userId}:`, {
      userId: request.userId,
      avatarUrl: profile?.avatarUrl,
      timestamp: new Date().toISOString()
    });
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log(`Avatar image loaded successfully for join request user ${request.userId}:`, {
      userId: request.userId,
      avatarUrl: profile?.avatarUrl,
      timestamp: new Date().toISOString()
    });
    setImageError(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
        <div>
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-1" />
          <div className="h-3 w-32 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={profile?.avatarUrl} 
            alt={profile?.firstName || 'User'}
            onError={handleImageError}
            onLoad={handleImageLoad}
            className="object-cover"
          />
          <AvatarFallback className="bg-terracotta/20 text-terracotta">
            {profile?.firstName 
              ? profile.firstName.charAt(0).toUpperCase()
              : <User className="h-4 w-4" />
            }
          </AvatarFallback>
        </Avatar>
        {imageError && profile?.avatarUrl && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" 
               title="Avatar failed to load" />
        )}
      </div>
      <div>
        <p className="font-medium">{profile?.firstName || 'Unknown User'}</p>
        <p className="text-sm text-muted-foreground">
          Requested on {new Date(request.createdAt).toLocaleDateString()}
        </p>
        {profile?.avatarUrl && (
          <p className="text-xs text-muted-foreground">
            Avatar: {imageError ? '❌ Failed' : '✅ Loaded'}
          </p>
        )}
      </div>
    </div>
  );
};

export const JoinRequestsCard = ({ isOwner }: JoinRequestsCardProps) => {
  const { joinRequests, approveJoinRequest, rejectJoinRequest } = useHousehold();

  console.log('JoinRequestsCard - Join requests data:', {
    totalRequests: joinRequests.length,
    requests: joinRequests.map(r => ({
      id: r.id,
      userId: r.userId,
      status: r.status,
      createdAt: r.createdAt
    })),
    timestamp: new Date().toISOString()
  });

  if (!isOwner) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Join Requests ({joinRequests.length})
        </CardTitle>
        <CardDescription>
          Users requesting to join your household.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {joinRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending join requests.</p>
        ) : (
          <div className="space-y-3">
            {joinRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded">
                <JoinRequestUserCard request={request} />
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
