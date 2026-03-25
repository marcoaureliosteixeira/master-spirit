// Service Worker — Master Spirit Push Notifications
self.addEventListener('push', function(event) {
  var data = { title: 'Master Spirit', body: 'Sua sessão está prestes a começar!', icon: 'logo.png' };
  try {
    data = event.data.json();
  } catch(e) {
    try { data.body = event.data.text(); } catch(e2) {}
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Master Spirit', {
      body: data.body || '',
      icon: data.icon || 'logo.png',
      badge: 'logo.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'master-spirit',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].url.includes(self.location.origin) && 'focus' in clientList[i]) {
          clientList[i].navigate(url);
          return clientList[i].focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
