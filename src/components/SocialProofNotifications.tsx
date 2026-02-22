import { useEffect, useState } from 'react';

const names = ['Marcela', 'Matheus', 'Ana', 'João', 'Beatriz', 'Carlos', 'Fernanda', 'Lucas', 'Juliana', 'Rafael', 'Camila', 'Gustavo', 'Larissa', 'Diego', 'Patrícia'];
const amounts = [2, 5, 10, 15, 20, 25, 30, 50, 100];

const SocialProofNotifications = () => {
  const [notification, setNotification] = useState<{ name: string; amount: number; visible: boolean } | null>(null);

  useEffect(() => {
    const showNotification = () => {
      const name = names[Math.floor(Math.random() * names.length)];
      const amount = amounts[Math.floor(Math.random() * amounts.length)];

      // Only visual — does NOT save to database or state
      setNotification({ name, amount, visible: true });

      setTimeout(() => {
        setNotification(prev => prev ? { ...prev, visible: false } : null);
      }, 3000);

      setTimeout(() => {
        setNotification(null);
      }, 3400);
    };

    const interval = setInterval(showNotification, 8000);
    const initial = setTimeout(showNotification, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(initial);
    };
  }, []);

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
