import { useEffect, useState, useCallback } from 'react';

const names = ['Marcela', 'Matheus', 'Ana', 'João', 'Beatriz', 'Carlos', 'Fernanda', 'Lucas', 'Juliana', 'Rafael', 'Camila', 'Gustavo', 'Larissa', 'Diego', 'Patrícia'];
const amounts = [2, 5, 10, 15, 20, 25, 30, 50, 100];
const campaignNames = ['Resgate do Rex', 'Cirurgia da Luna', 'Abrigo Esperança', 'Castração Solidária', 'Lar dos Peludos'];

export interface FakeNotification {
  id: string;
  name: string;
  amount: number;
  type: 'campaign' | 'food';
  campaignName: string;
}

type Listener = (notification: FakeNotification) => void;

const listeners: Set<Listener> = new Set();

function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generate(): FakeNotification {
  const type = Math.random() > 0.3 ? 'campaign' : 'food';
  return {
    id: crypto.randomUUID(),
    name: randomItem(names),
    amount: randomItem(amounts),
    type,
    campaignName: type === 'food' ? 'Ração' : randomItem(campaignNames),
  };
}

export function useFakeNotifications() {
  const [items, setItems] = useState<(FakeNotification & { time: string })[]>([]);

  useEffect(() => {
    // Generate initial history
    const timeLabels = ['1 min', '2 min', '3 min', '5 min', '8 min', '10 min', '12 min', '15 min', '20 min', '25 min', '30 min', '45 min', '1h', '1h30', '2h'];
    const initial = timeLabels.map(t => ({ ...generate(), time: t + ' atrás' }));
    setItems(initial);

    // Listen for new notifications
    const unsub = subscribe((n) => {
      setItems(prev => [{ ...n, time: 'agora' }, ...prev].slice(0, 50));
    });
    return unsub;
  }, []);

  return items;
}

// The emitter — used by SocialProofNotifications
let intervalId: ReturnType<typeof setInterval> | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;
let started = false;

function emit(n: FakeNotification) {
  listeners.forEach(fn => fn(n));
}

export function startNotificationEngine() {
  if (started) return () => {};
  started = true;

  const fire = () => {
    const n = generate();
    emit(n);
    // Also set current for the toast component
    if (currentSetter) currentSetter(n);
  };

  timeoutId = setTimeout(fire, 3000);
  intervalId = setInterval(fire, 8000);

  return () => {
    started = false;
    if (intervalId) clearInterval(intervalId);
    if (timeoutId) clearTimeout(timeoutId);
  };
}

let currentSetter: ((n: FakeNotification | null) => void) | null = null;

export function useNotificationToast() {
  const [notification, setNotification] = useState<(FakeNotification & { visible: boolean }) | null>(null);

  useEffect(() => {
    currentSetter = (n) => {
      if (!n) { setNotification(null); return; }
      setNotification({ ...n, visible: true });
      setTimeout(() => setNotification(prev => prev ? { ...prev, visible: false } : null), 3000);
      setTimeout(() => setNotification(null), 3400);
    };
    return () => { currentSetter = null; };
  }, []);

  useEffect(() => {
    return startNotificationEngine();
  }, []);

  return notification;
}
