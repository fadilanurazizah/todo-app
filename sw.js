const CACHE_NAME = 'todo-app-v1.0.0';
const STATIC_CACHE_NAME = 'todo-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'todo-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/script.js',
  '/images/fadila-profile.jpg',
  '/manifest.json',
  // Add fallback offline page
  '/offline.html'
];

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName !== STATIC_CACHE_NAME && 
                     cacheName !== DYNAMIC_CACHE_NAME;
            })
            .map(cacheName => {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response for caching
            const responseToCache = networkResponse.clone();

            // Cache dynamic content
            caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // Serve offline fallback for HTML requests
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
            
            // Serve placeholder for images
            if (event.request.destination === 'image') {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="14" fill="#666">Image unavailable</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
          });
      })
  );
});

// Background sync for offline todo creation
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync-todos') {
    event.waitUntil(syncTodos());
  }
});

// Sync todos when back online
function syncTodos() {
  return new Promise((resolve, reject) => {
    // Get pending todos from IndexedDB or localStorage
    // This would sync with backend when available
    console.log('Service Worker: Syncing todos...');
    
    // For now, just resolve immediately
    // In production, this would sync with server
    resolve();
  });
}

// Push notifications
self.addEventListener('push', event => {
  console.log('Service Worker: Push message received');
  
  let notificationData = {};
  
  if (event.data) {
    notificationData = event.data.json();
  }
  
  const options = {
    body: notificationData.body || 'You have a todo reminder!',
    icon: '/images/icon-192.png',
    badge: '/images/icon-72.png',
    vibrate: [200, 100, 200],
    data: notificationData,
    actions: [
      {
        action: 'view',
        title: 'View Todo',
        icon: '/images/icon-72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/images/icon-72.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'Todo Reminder',
      options
    )
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle message from main app
self.addEventListener('message', event => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Send response back to main app
  event.ports[0].postMessage({
    type: 'SW_RESPONSE',
    message: 'Service Worker is active'
  });
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
  console.log('Service Worker: Periodic sync triggered', event.tag);
  
  if (event.tag === 'todo-reminders') {
    event.waitUntil(checkTodoDeadlines());
  }
});

// Check for upcoming todo deadlines
function checkTodoDeadlines() {
  return new Promise((resolve) => {
    // This would check localStorage or IndexedDB for upcoming deadlines
    // and show notifications accordingly
    console.log('Service Worker: Checking todo deadlines...');
    resolve();
  });
}

// Cache update notification
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    event.waitUntil(
      checkForUpdates().then(hasUpdate => {
        event.ports[0].postMessage({
          type: 'UPDATE_AVAILABLE',
          hasUpdate: hasUpdate
        });
      })
    );
  }
});

function checkForUpdates() {
  return fetch('/sw.js')
    .then(response => response.text())
    .then(swCode => {
      // Simple check - in production, use version numbers
      return swCode.includes('todo-app-v1.0.0');
    })
    .catch(() => false);
}