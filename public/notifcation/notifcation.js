async function loadNotifications() {
  const response = await fetch("notifications.json");
  const notifications = await response.json();

  const container = document.getElementById("notificationContainer");
  if (!container) return;

  notifications.forEach(item => {
    const div = document.createElement("div");
    div.style.padding = "10px";
    div.style.marginBottom = "10px";
    div.style.border = "1px solid #ccc";
    div.style.borderRadius = "8px";
    div.innerHTML = `<b>${item.icon}</b> - ${item.message}`;
    container.appendChild(div);
  });
}

loadNotifications();
