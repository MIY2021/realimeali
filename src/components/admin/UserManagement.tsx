
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Mail, Calendar } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  auth_provider: string | null;
  profile_completed: boolean | null;
}

export function UserManagement() {
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url, created_at, auth_provider, profile_completed')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const UserCard = ({ user }: { user: UserProfile }) => (
    <Card className={isMobile ? "mb-2 shadow-sm" : "mb-4"}>
      <CardContent className={isMobile ? "pt-3 pb-3 px-3" : "pt-6"}>
        <div className={`flex items-center ${isMobile ? "gap-2" : "space-x-4"}`}>
          <Avatar className={isMobile ? "h-10 w-10 flex-shrink-0" : "h-12 w-12"}>
            <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || 'User'} />
            <AvatarFallback className={isMobile ? "text-xs" : ""}>
              {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className={`flex items-center gap-2 ${isMobile ? "flex-wrap" : ""}`}>
              <h4 className={`font-medium truncate ${isMobile ? "text-xs" : "text-sm"}`}>
                {user.full_name || 'Unnamed User'}
              </h4>
              <div className={`flex gap-1 flex-shrink-0 ${isMobile ? "flex-wrap" : ""}`}>
                {user.profile_completed && (
                  <Badge variant="secondary" className={isMobile ? "text-[10px] px-1.5 py-0" : "text-xs"}>Verified</Badge>
                )}
                {user.auth_provider && (
                  <Badge variant="outline" className={isMobile ? "text-[10px] px-1.5 py-0" : "text-xs"}>
                    {user.auth_provider}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className={`flex items-center text-muted-foreground mt-1 ${isMobile ? "flex-col items-start gap-1 text-[10px]" : "gap-4 text-xs"}`}>
              <div className="flex items-center gap-1 truncate max-w-full">
                <Mail className={isMobile ? "h-2.5 w-2.5 flex-shrink-0" : "h-3 w-3"} />
                <span className="truncate">{user.email || 'No email'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className={isMobile ? "h-2.5 w-2.5" : "h-3 w-3"} />
                <span>Joined {new Date(user.created_at).toLocaleDateString(isMobile ? 'en-US' : undefined, isMobile ? { month: 'short', day: 'numeric', year: 'numeric' } : undefined)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isMobile ? "space-y-3" : ""}`}>
      <div className={`flex items-center gap-2 ${isMobile ? "mb-3" : "mb-4"}`}>
        <Users className={`text-terracotta ${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
        <h3 className={`font-medium ${isMobile ? "text-base" : "text-lg"}`}>
          Recent Users ({users.length})
        </h3>
      </div>
      
      {users.length === 0 ? (
        <div className={`text-center ${isMobile ? "py-6" : "py-8"}`}>
          <Users className={`text-muted-foreground mx-auto mb-4 ${isMobile ? "h-8 w-8" : "h-12 w-12"}`} />
          <p className={`text-muted-foreground ${isMobile ? "text-sm" : ""}`}>No users found</p>
        </div>
      ) : (
        <div className={`overflow-y-auto ${isMobile ? "space-y-1 max-h-[60vh]" : "space-y-2 max-h-96"}`}>
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
