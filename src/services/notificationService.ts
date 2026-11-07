// Notification and Service Worker Service
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch (error) {
    console.warn('Service Worker registration skipped/failed:', error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission();
  }
  return Notification.permission;
}

export async function sendPushNotification(title: string, body: string, url: string = '/') {
  // If user granted permission
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    // Try via service worker controller first
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
        icon: '/icon.svg',
        data: url
      });
      return;
    }

    // Try via ready registration
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      try {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification(title, {
          body,
          icon: '/icon.svg',
          badge: '/icon.svg',
          data: url
        });
        return;
      } catch (err) {
        console.warn('Failed to show notification via registration', err);
      }
    }

    // Fallback direct Notification
    try {
      new Notification(title, {
        body,
        icon: '/icon.svg'
      });
    } catch {
      // Ignored
    }
  }
}
