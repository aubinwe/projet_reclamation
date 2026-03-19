# IBAM - Système de Gestion des Réclamations 🎓

Bienvenue sur la plateforme officielle de gestion des réclamations de l'**Institut Burkinabé des Arts et Métiers (IBAM)**. Cette application permet aux étudiants de soumettre des réclamations sur leurs notes et aux équipes pédagogiques de les traiter de manière transparente et structurée.

---

## 🚀 Installation Rapide (Docker)

La méthode recommandée est d'utiliser **Docker** pour garantir une configuration identique pour tous.

### 1. Prérequis
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et lancé.
- Git (pour cloner le projet).

### 2. Configuration
1. Clonez le dépôt et entrez dans le dossier.
2. Configurez le fichier `.env` dans le dossier `backend/` :
   ```env
   DB_HOST=db
   DB_DATABASE=ibam_reclamation
   DB_USERNAME=root
   DB_PASSWORD=root
   ```

### 3. Lancement
À la racine du projet, lancez :
```bash
docker-compose up -d --build
```

### 4. Initialisation des données
Exécutez ces commandes une seule fois pour préparer la base de données :
```bash
docker exec -it ibam-app composer install
docker exec -it ibam-app php artisan key:generate
docker exec -it ibam-app php artisan migrate --seed
```

---

## 💡 accès aux Services

- **Application Web (Frontend)** : [http://localhost:3000](http://localhost:3000)
- **API (Backend)** : [http://localhost:8000](http://localhost:8000)
- **Base de données** : Port 3306 (identifiants `ibam_user` / `root`)

---

## 🔑 Comptes de Test

| Rôle | Email | Mot de passe |
| :--- | :--- | :--- |
| **Directeur Académique (DA)** | `da@ibam.com` | `password` |
| **Service Scolarité** | `scolarite@ibam.com` | `password` |
| **Enseignant** | `enseignant1@ibam.com` | `password` |
| **Étudiant** | `etudiant1@ibam.com` | `password` |

---

## 🛠️ Installation Classique (Sans Docker)

Si vous préférez installer le projet manuellement sur votre machine :

### Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env (puis configurez votre MySQL local)
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 🏗️ Structure du Projet

- **/frontend** : Application React.js avec TailwindCSS (Vite).
- **/backend** : API REST Laravel 11.
- **/docker** : Configurations Docker et Nginx.

---

## ✨ Fonctionnalités Clés

- **Authentification sécurisée** : Connexion multi-rôles.
- **Circuit de validation** : Student → Scolarité → DA → Enseignant.
- **Gestion des notes** : Mise à jour sécurisée des notes après validation.
- **Notifications** : Suivi en temps réel de l'état de la demande.
- **Justificatifs** : Possibilité de télécharger des preuves (PDF/Images).
- **Récupération de compte** : Système de mot de passe oublié via Gmail.

---

© 2025 - **Institut Burkinabé des Arts et Métiers**
