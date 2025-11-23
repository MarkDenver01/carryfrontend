async function loadNotifications() {
  const response = await fetch("notifications.json");
  const notifications = await response.json();

  const container = document.getElementById("notificationContainer");
  if (!container) return;

  notifications.forEach((item, index) => {
    const div = document.createElement("div");

    // STYLE
    div.className =
      "cursor-pointer p-3 mb-2 border rounded-lg hover:bg-gray-100 transition";

    // CONTENT
    div.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="font-bold">${item.icon}</span>
        <span>${item.message}</span>
      </div>
    `;

    // CLICK FUNCTION DITO 🔥🔥🔥
    div.addEventListener("click", () => {
      alert("You clicked: " + item.message);
    });

    container.appendChild(div);
  });
}

loadNotifications();
