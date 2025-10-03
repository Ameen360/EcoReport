/**
 * EcoReport - Service Worker
 * Enables offline functionality and Progressive Web App features
 */

// Cache name (update version when making changes to cached files)
const CACHE_NAME = 'ecoreport-cache-v1';

// Files to cache for offline use
const filesToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/responsive.css',
  '/js/app.js',
  '/js/auth.js',
  '/js/map.js',
  '/js/reports.js',
  '/js/dashboard.js',
  '/js/community.js',
  '/js/education.js',
  '/js/ui.js',
  '/images/ecoreport-logo.png',
  '/images/default-avatar.png',
  '/images/hero-bg.jpg',
  // Icons
  '/images/report-icon.svg',
  '/images/map-icon.svg',
  '/images/community-icon.svg',
  '/images/data-icon.svg',
  '/images/location-icon.svg',
  '/images/calendar-icon.svg',
  '/images/upload-icon.svg',
  '/images/search.svg',
  '/images/alert-warning.svg',
  '/images/alert-danger.svg',
  '/images/alert-info.svg',
  // Default images
  '/images/placeholder-report.jpg',
  '/images/events/default-event.jpg',
  '/images/petitions/default-petition.jpg',
  '/images/resources/default-resource.jpg',
  '/images/tips/default-tip.svg',
  // Fonts (if self-hosted)
  // '/fonts/nunito-regular.woff2',
  // '/fonts/nunito-bold.woff2',
  // '/fonts/open-sans-regular.woff2',
  // '/fonts/open-sans-bold.woff2',
];

// Install event - cache files for offline use
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...');
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell and content');
        return cache.addAll(filesToCache);
      })
      .catch(error => {
        console.error('[Service Worker] Cache install error:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker...');
  
  // Claim clients to ensure page is controlled immediately
  event.waitUntil(self.clients.claim());
  
  // Remove old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip browser-sync and socket.io requests (for development)
  if (event.request.url.includes('browser-sync') || event.request.url.includes('socket.io')) {
    return;
  }
  
  // For HTML requests, use network-first strategy
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the latest version
          let responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, serve from cache
          return caches.match(event.request).then(response => {
            return response || caches.match('/index.html');
          });
        })
    );
    return;
  }
  
  // For API requests, use network-only strategy
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If network fails, return offline API response
          return new Response(
            JSON.stringify({ 
              error: 'You are offline. Please check your connection and try again.' 
            }),
            { 
              headers: { 'Content-Type': 'application/json' },
              status: 503
            }
          );
        })
    );
    return;
  }
  
  // For all other requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Cache the response
            let responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
            
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch error:', error);
            
            // For image requests, return fallback image
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
              return caches.match('/images/placeholder-report.jpg');
            }
            
            // For other requests, just propagate the error
            throw error;
          });
      })
  );
});

// Push notification event
self.addEventListener('push', event => {
  console.log('[Service Worker] Push notification received:', event);
  
  let notificationData = {};
  
  try {
    notificationData = event.data.json();
  } catch (e) {
    notificationData = {
      title: 'EcoReport Notification',
      body: event.data ? event.data.text() : 'New update from EcoReport',
      icon: '/images/ecoreport-logo.png'
    };
  }
  
  const options = {
    body: notificationData.body,
    icon: notificationData.icon || '/images/ecoreport-logo.png',
    badge: '/images/notification-badge.png',
    vibrate: [100, 50, 100],
    data: notificationData.data || {},
    actions: notificationData.actions || [
      { action: 'view', title: 'View' },
      { action: 'close', title: 'Close' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click:', event);
  
  event.notification.close();
  
  // Handle notification click based on action
  if (event.action === 'view') {
    const urlToOpen = event.notification.data.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then(clientList => {
          // Check if there's already a window open
          for (const client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          
          // If no window is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Background sync event for offline form submissions
self.addEventListener('sync', event => {
  console.log('[Service Worker] Background sync event:', event);
  
  if (event.tag === 'sync-reports') {
    event.waitUntil(syncReports());
  } else if (event.tag === 'sync-comments') {
    event.waitUntil(syncComments());
  }
});

// Function to sync reports that were submitted offline
async function syncReports() {
  try {
    // Open IndexedDB to get stored offline reports
    const db = await openDB('ecoreport-offline', 1);
    const offlineReports = await db.getAll('reports');
    
    // If there are offline reports, send them to the server
    if (offlineReports.length > 0) {
      for (const report of offlineReports) {
        try {
          // In a real app, this would send the report to the server
          // const response = await fetch('/api/reports', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(report)
          // });
          
          // If successful, remove from IndexedDB
          // if (response.ok) {
          //   await db.delete('reports', report.id);
          // }
          
          // For this demo, just remove from IndexedDB
          await db.delete('reports', report.id);
          
          // Show notification that report was synced
          self.registration.showNotification('Report Synced', {
            body: 'Your report has been successfully submitted.',
            icon: '/images/ecoreport-logo.png'
          });
        } catch (error) {
          console.error('[Service Worker] Error syncing report:', error);
        }
      }
    }
  } catch (error) {
    console.error('[Service Worker] Error in syncReports:', error);
  }
}

// Function to sync comments that were submitted offline
async function syncComments() {
  try {
    // Open IndexedDB to get stored offline comments
    const db = await openDB('ecoreport-offline', 1);
    const offlineComments = await db.getAll('comments');
    
    // If there are offline comments, send them to the server
    if (offlineComments.length > 0) {
      for (const comment of offlineComments) {
        try {
          // In a real app, this would send the comment to the server
          // const response = await fetch('/api/comments', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(comment)
          // });
          
          // If successful, remove from IndexedDB
          // if (response.ok) {
          //   await db.delete('comments', comment.id);
          // }
          
          // For this demo, just remove from IndexedDB
          await db.delete('comments', comment.id);
        } catch (error) {
          console.error('[Service Worker] Error syncing comment:', error);
        }
      }
    }
  } catch (error) {
    console.error('[Service Worker] Error in syncComments:', error);
  }
}

// Helper function to open IndexedDB
function openDB(name, version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('reports')) {
        db.createObjectStore('reports', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('comments')) {
        db.createObjectStore('comments', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = event => {
      resolve(event.target.result);
    };
    
    request.onerror = event => {
      reject(event.target.error);
    };
  });
}