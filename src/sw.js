self.addEventListener("install", function(event) {
  console.log("Service Worker installing.");
  self.skipWaiting();
});

self.addEventListener("activate", function(event) {
  console.log("Service Worker activating.");
});

self.addEventListener("push", function(event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/flowers.jpg",
    tag: data.tag,
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
