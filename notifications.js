/* ==================================
   AFRICONNECT - NOTIFICATIONS
================================== */

import { auth, db } from "../firebase.js";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

const notificationsList =
  document.getElementById("notificationsList");

const notificationStatus =
  document.getElementById("notificationStatus");

let currentUser = null;

function showStatus(message, isError = false) {
  if (!notificationStatus) return;

  notificationStatus.textContent = message;
  notificationStatus.style.color = isError ? "#c62828" : "#087f5b";
}

function displayNotification(data) {
  if (!notificationsList) return;

  const item = document.createElement("article");
  item.className = "message";

  const title = document.createElement("h3");
  title.textContent = data.title || "Notification AfriConnect";

  const content = document.createElement("p");
  content.textContent = data.message || "";

  item.append(title, content);
  notificationsList.appendChild(item);
}

async function loadNotifications() {
  if (!currentUser || !notificationsList) return;

  notificationsList.replaceChildren();

  try {
    const notificationQuery = query(
      collection(db, "notifications"),
      where("recipientUid", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const snapshot = await getDocs(notificationQuery);

    if (snapshot.empty) {
      notificationsList.textContent =
        "Tu n'as pas encore de notifications.";
      return;
    }

    snapshot.forEach((notificationDocument) => {
      displayNotification(notificationDocument.data());
    });
  } catch (error) {
    console.error("Erreur de chargement des notifications :", error);
    showStatus(
      "Impossible de charger les notifications. Vérifie les règles Firestore et les index.",
      true
    );
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user || !user.emailVerified) {
    window.location.replace("connexion.html");
    return;
  }

  currentUser = user;
  await loadNotifications();
});