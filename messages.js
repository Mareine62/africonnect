/* ==================================
   AFRICONNECT - MESSAGERIE PRIVÉE
================================== */

import { auth, db } from "../firebase.js";

import {
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  where
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

const messageForm = document.getElementById("messageForm");
const recipientUidInput = document.getElementById("recipientUid");
const messageContentInput = document.getElementById("messageContent");
const messagesList = document.getElementById("messagesList");
const messageStatus = document.getElementById("messageStatus");

let currentUser = null;
let authReady = false;

function showMessageStatus(message, isError = false) {
  if (!messageStatus) return;

  messageStatus.textContent = message;
  messageStatus.style.color = isError ? "#c62828" : "#087f5b";
}

function displayMessage(data) {
  const item = document.createElement("article");
  item.className = "message";

  const sender = document.createElement("p");
  sender.className = "muted";
  sender.textContent =
    data.senderUid === currentUser.uid ? "Moi" : "Autre utilisateur";

  const content = document.createElement("p");
  content.textContent = data.content || "";

  item.append(sender, content);
  messagesList.appendChild(item);
}

async function loadMessages(recipientUid) {
  if (!messagesList) return;

  if (!authReady || !currentUser) {
    messagesList.textContent = "Vérification de la connexion...";
    return;
  }

  if (!recipientUid) {
    messagesList.textContent =
      "Saisis l'identifiant Firebase d'un membre pour afficher la conversation.";
    return;
  }

  if (recipientUid === currentUser.uid) {
    messagesList.textContent =
      "Choisis un autre membre pour afficher une conversation.";
    return;
  }

  messagesList.textContent = "Chargement des messages...";
  showMessageStatus("");

  try {
    const receivedQuery = query(
      collection(db, "messages"),
      where("senderUid", "==", recipientUid),
      where("recipientUid", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const sentQuery = query(
      collection(db, "messages"),
      where("senderUid", "==", currentUser.uid),
      where("recipientUid", "==", recipientUid),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const [received, sent] = await Promise.all([
      getDocs(receivedQuery),
      getDocs(sentQuery)
    ]);

    const combined = [];

    received.forEach((documentSnapshot) => {
      combined.push({
        id: documentSnapshot.id,
        ...documentSnapshot.data()
      });
    });

    sent.forEach((documentSnapshot) => {
      combined.push({
        id: documentSnapshot.id,
        ...documentSnapshot.data()
      });
    });

    combined.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.toMillis?.() || 0;
      return timeA - timeB;
    });

    messagesList.replaceChildren();

    if (combined.length === 0) {
      messagesList.textContent =
        "Aucun message dans cette conversation. Tu peux envoyer le premier.";
      return;
    }

    combined.forEach(displayMessage);
  } catch (error) {
    console.error("Erreur de chargement des messages :", error);

    messagesList.textContent =
      "Impossible de charger les messages. Consulte le message d'erreur ci-dessous.";

    if (error.code === "failed-precondition") {
      showMessageStatus(
        "Un index Firestore peut être nécessaire. Consulte la console du navigateur.",
        true
      );
    } else if (error.code === "permission-denied") {
      showMessageStatus(
        "Accès refusé par Firestore. Vérifie les règles et la connexion.",
        true
      );
    } else {
      showMessageStatus(
        "Erreur : " + (error.code || error.message || "inconnue"),
        true
      );
    }
  }
}

onAuthStateChanged(auth, (user) => {
  if (!user || !user.emailVerified) {
    window.location.replace("connexion.html");
    return;
  }

  currentUser = user;
  authReady = true;

  // Afficher une instruction ou charger la conversation
  const recipientUid = recipientUidInput?.value.trim() || "";
  loadMessages(recipientUid);
});

if (recipientUidInput) {
  recipientUidInput.addEventListener("change", () => {
    const recipientUid = recipientUidInput.value.trim();
    loadMessages(recipientUid);
  });
}

if (messageForm) {
  messageForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!authReady || !currentUser) {
      showMessageStatus(
        "Attends la vérification de ta connexion.",
        true
      );
      return;
    }

    const recipientUid = recipientUidInput?.value.trim() || "";
    const content = messageContentInput?.value.trim() || "";

    if (!recipientUid || !content) {
      showMessageStatus(
        "Indique l'identifiant du destinataire et écris un message.",
        true
      );
      return;
    }

    if (recipientUid === currentUser.uid) {
      showMessageStatus(
        "Tu ne peux pas t'envoyer un message à toi-même.",
        true
      );
      return;
    }

    if (content.length > 2000) {
      showMessageStatus("Le message est trop long.", true);
      return;
    }

    try {
      await addDoc(collection(db, "messages"), {
        senderUid: currentUser.uid,
        recipientUid: recipientUid,
        content: content,
        createdAt: serverTimestamp()
      });

      messageContentInput.value = "";
      showMessageStatus("Message envoyé avec succès.");

      await loadMessages(recipientUid);
    } catch (error) {
      console.error("Erreur d'envoi du message :", error);

      showMessageStatus(
        "Envoi impossible : " +
          (error.code || error.message || "erreur inconnue"),
        true
      );
    }
  });
}

// Éviter de laisser le texte de chargement affiché indéfiniment
if (messagesList && !recipientUidInput?.value.trim()) {
  messagesList.textContent =
    "Saisis l'identifiant Firebase d'un membre pour afficher la conversation.";
}
