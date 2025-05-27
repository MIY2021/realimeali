
export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return { granted: false, denied: true, default: false };
    }

    if (Notification.permission === 'granted') {
      return { granted: true, denied: false, default: false };
    }

    if (Notification.permission === 'denied') {
      return { granted: false, denied: true, default: false };
    }

    const permission = await Notification.requestPermission();
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default',
    };
  }

  showNotification(title: string, options?: NotificationOptions): Notification | null {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return null;
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });

    // Auto-close notification after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }

  showApprovalRequestNotification(requesterName: string, weekNumber: number): Notification | null {
    return this.showNotification(
      'New Meal Plan Approval Request',
      {
        body: `${requesterName} requested approval for Week ${weekNumber} meal plan`,
        tag: 'meal-plan-approval',
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'View Meal Plan' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      }
    );
  }

  showApprovalCompleteNotification(weekNumber: number, approved: boolean): Notification | null {
    return this.showNotification(
      `Meal Plan ${approved ? 'Approved' : 'Rejected'}`,
      {
        body: `Week ${weekNumber} meal plan has been ${approved ? 'approved' : 'rejected'} by all members`,
        tag: 'meal-plan-approval-complete',
      }
    );
  }
}

export const notificationService = NotificationService.getInstance();
