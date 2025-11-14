import { toast } from 'sonner';
import { Achievement } from '@/types/achievements';
import { Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function showAchievementToast(achievement: Achievement) {
  const navigate = typeof window !== 'undefined' ? require('react-router-dom').useNavigate : null;
  
  toast.custom(
    (t) => (
      <div 
        className="bg-white rounded-xl shadow-2xl border-2 border-yellow-400 p-4 max-w-md animate-in slide-in-from-bottom-5 duration-300"
        style={{
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
        }}
      >
        <div className="flex items-start gap-3">
          {/* Icon Section */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full p-3">
                <Star className="h-6 w-6 text-white fill-white" />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-yellow-600 animate-pulse" />
              <p className="text-xs font-bold text-yellow-800 uppercase tracking-wide">
                Achievement Unlocked!
              </p>
            </div>
            
            <h3 className="font-bold text-gray-900 text-base mb-1">
              {achievement.name}
            </h3>
            
            <p className="text-sm text-gray-600 mb-3">
              {achievement.summary}
            </p>

            {/* Action Button */}
            <Button
              size="sm"
              onClick={() => {
                toast.dismiss(t);
                if (typeof window !== 'undefined') {
                  window.location.href = '/achievements';
                }
              }}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white border-0 shadow-md"
            >
              View Achievement
            </Button>
          </div>
        </div>

        {/* Decorative sparkles */}
        <div className="absolute -top-1 -right-1">
          <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -left-1">
          <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
    ),
    {
      duration: 6000,
      position: 'top-center'
    }
  );
}
