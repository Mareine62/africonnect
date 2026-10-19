/* ==================================
   AFRICONNECT - PARAMÈTRES DU COMPTE
================================== */

import { auth, db } from "../firebase.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

const settingsForm = document.getElementById("settingsForm");
const settingsName = document.getElementById("settingsName");
const settingsBio = document.getElementById("settingsBio");
const settingsEmail = document.getElementById("settingsEmail");
const settingsStatus = document.getElementById("settingsStatus");
const logoutButton = document.getElementById("settingsLogout");

let currentUser = null;

function showSettingsStatus(message, isError = false) {
  if (!settingsStatus) return;

  settingsStatus.textContent = message;
  settingsStatus.style.color = isError ? "#c62828" : "#087f5b";
}

onAuthStateChanged(auth, async (user) => {
  if (!user || !user.emailVerified) {
    window.location.replace("connexion.html");
    return;
  }

  currentUser = user;

  if (settingsEmail) {
    settingsEmail.textContent = user.email || "";
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      const data = snapshot.data();

      if (settingsName) {
        settingsName.value = data.name || "";
      }

      if (settingsBio) {
        settingsBio.value = data.bio || "";
      }
    }
  } catch (error) {
    console.error("Erreur de lecture des paramètres :", error);
    showSettingsStatus(
      "Impossible de charger les paramètres. Vérifie les règles Firestore.",
      true
    );
  }
});

if (settingsForm) {
  settingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentUser) {
      showSettingsStatus("Connecte-toi avant de continuer.", true);
      return;
    }

    const name = settingsName?.value.trim() || "";
    const bio = settingsBio?.value.trim() || "";

    if (!name) {
      showSettingsStatus("Le nom affiché est obligatoire.", true);
      return;
    }

    if (name.length > 60 || bio.length > 300) {
      showSettingsStatus(
        "Le nom est limité à 60 caractères et la biographie à 300.",
        true
      );
      return;
    }

    try {
      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          name,
          bio,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      showSettingsStatus("Paramètres enregistrés.");
    } catch (error) {
      console.error("Erreur d'enregistrement :", error);
      showSettingsStatus(
        "Enregistrement impossible. Vérifie les règles Firestore.",
        true
      );
    }
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.replace("connexion.html");
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
      showSettingsStatus("Déconnexion impossible. Réessaie.", true);
    }
  });
}