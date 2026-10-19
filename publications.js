/* ==================================
   AFRICONNECT - PUBLICATIONS
================================== */

import { auth, db } from "../firebase.js";

import {
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

const postForm = document.getElementById("postForm");
const postContent = document.getElementById("postContent");
const postsList = document.getElementById("postsList");
const postMessage = document.getElementById("postMessage");

let currentUser = null;

function showPostMessage(message, isError = false) {
  if (!postMessage) return;

  postMessage.textContent = message;
  postMessage.style.color = isError ? "#c62828" : "#087f5b";
}

function displayPost(post, id) {
  if (!postsList) return;

  const article = document.createElement("article");
  article.className = "post";

  const author = document.createElement("p");
  author.className = "muted";
  author.textContent = post.authorEmail || "Utilisateur AfriConnect";

  const content = document.createElement("p");
  content.className = "post-content";
  content.textContent = post.content || "";

  article.append(author, content);
  article.dataset.postId = id;

  postsList.appendChild(article);
}

async function loadPosts() {
  if (!postsList) return;

  postsList.replaceChildren();

  try {
    const postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(30)
    );

    const snapshot = await getDocs(postsQuery);

    snapshot.forEach((postDocument) => {
      displayPost(postDocument.data(), postDocument.id);
    });

    if (snapshot.empty) {
      postsList.textContent = "Aucune publication pour le moment.";
    }
  } catch (error) {
    console.error("Erreur de chargement des publications :", error);
    postsList.textContent =
      "Impossible de charger les publications. Vérifie les règles Firestore.";
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user || !user.emailVerified) {
    window.location.replace("connexion.html");
    return;
  }

  currentUser = user;
  await loadPosts();
});

if (postForm) {
  postForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentUser) {
      showPostMessage("Connecte-toi avant de publier.", true);
      return;
    }

    const content = postContent?.value.trim() || "";

    if (!content) {
      showPostMessage("Écris un message avant de publier.", true);
      return;
    }

    if (content.length > 2000) {
      showPostMessage("Le message ne doit pas dépasser 2000 caractères.", true);
      return;
    }

    try {
      await addDoc(collection(db, "posts"), {
        content,
        authorUid: currentUser.uid,
        authorEmail: currentUser.email || "",
        createdAt: serverTimestamp()
      });

      postContent.value = "";
      showPostMessage("Publication ajoutée !");
      await loadPosts();
    } catch (error) {
      console.error("Erreur de publication :", error);
      showPostMessage(
        "Publication impossible. Vérifie les règles Firestore.",
        true
      );
    }
  });
}