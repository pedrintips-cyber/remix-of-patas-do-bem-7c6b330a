import { useNotificationToast } from '@/hooks/useFakeNotifications';

const SocialProofNotifications = () => {
  const notification = useNotificationToast();

  if (!notification) return null;

  return (
    <div className={`fixed top-4 right-4 z-[55] max-w-xs rounded-xl border border-border bg-card px-4 py-3 shadow-lg ${
      notification.visible ? 'animate-notification-in' : 'animate-notification-out'
    }`}>
      <p className="text-sm font-semibold text-foreground">
        💚 {notification.name} doou <span className="text-primary">R${notification.amount}</span>
      </p>
    </div>
  );
};

export default SocialProofNotifications;
