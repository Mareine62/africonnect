/* ==================================
   AFRICONNECT - GESTION DU PROFIL
================================== */

import { auth, db } from "../firebase.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

const profileForm = document.getElementById("profileForm");
const profileName = document.getElementById("profileName");
const profileBio = document.getElementById("profileBio");
const profileEmail = document.getElementById("profileEmail");
const profileMessage = document.getElementById("profileMessage");

let currentUser = null;

function showProfileMessage(message, isError = false) {
  if (!profileMessage) return;

  profileMessage.textContent = message;
  profileMessage.style.color = isError ? "#c62828" : "#087f5b";
}

onAuthStateChanged(auth, async (user) => {
  if (!user || !user.emailVerified) {
    window.location.replace("connexion.html");
    return;
  }

  currentUser = user;

  if (profileEmail) {
    profileEmail.textContent = user.email || "";
  }

  try {
    const profileRef = doc(db, "users", user.uid);
    const profileSnapshot = await getDoc(profileRef);

    if (profileSnapshot.exists()) {
      const data = profileSnapshot.data();

      if (profileName) {
        profileName.value = data.name || "";
      }

      if (profileBio) {
        profileBio.value = data.bio || "";
      }
    }
  } catch (error) {
    console.error("Erreur de lecture du profil :", error);
    showProfileMessage(
      "Impossible de charger le profil. Vérifie les règles Firestore.",
      true
    );
  }
});

if (profileForm) {
  profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentUser) {
      showProfileMessage("Connecte-toi avant d'enregistrer.", true);
      return;
    }

    const name = profileName?.value.trim() || "";
    const bio = profileBio?.value.trim() || "";

    if (!name) {
      showProfileMessage("Entre un nom de profil.", true);
      return;
    }

    try {
      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          name,
          bio,
          email: currentUser.email || "",
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      showProfileMessage("Profil enregistré avec succès !");
    } catch (error) {
      console.error("Erreur d'enregistrement :", error);
      showProfileMessage(
        "Enregistrement impossible. Vérifie les règles Firestore.",
        true
      );
    }
  });
}