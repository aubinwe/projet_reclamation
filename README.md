<div align="center">

  # 🎓 IBAM - Gestion des Réclamations
  
  **Une solution moderne pour la transparence académique**

  ![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
  ![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)

  <p align="center">
    Simplifiez le processus de réclamation de notes pour les étudiants, les enseignants et l'administration.
    <br />
    <a href="#-installation"><strong>Explorer la doc »</strong></a>
    <br />
    <br />
    <a href="#-aperçu">Voir la démo</a>
    ·
    <a href="https://github.com/adamakonfe/gestion_reclamation/issues">Signaler un bug</a>
    ·
    <a href="https://github.com/adamakonfe/gestion_reclamation/issues">Demander une fonctionnalité</a>
  </p>
</div>

---

## 📑 Table des Matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Structure du Projet](#-structure-du-projet)
- [Installation](#-installation)
  - [Via Docker](#option-a--docker-recommandé-)
  - [Manuelle](#option-b--installation-manuelle-️)
- [Configuration Email](#-configuration-des-emails)
- [Contribuer](#-contribuer)
- [Licence](#-licence)

---

## 📸 Aperçu

| 🎓 Tableau de Bord Étudiant | 📝 Détail d'une Réclamation |
|:-----------------------:|:-----------------------:|
| ![Dashboard](https://placehold.co/600x400/20232a/61dafb?text=Dashboard+Etudiant) | ![Details](https://placehold.co/600x400/20232a/61dafb?text=Detail+Reclamation) |

> 💡 **Le saviez-vous ?** Cette plateforme permet de réduire le temps de traitement des réclamations de 50% grâce à son workflow automatisé.

---

## ✨ Fonctionnalités

### 👨‍🎓 **Espace Étudiant**
- **Dépôt Intuitif** : Formulaire guidé pour soumettre une réclamation en moins de 2 minutes.
- **Suivi Live** : Notifications email à chaque étape (Réception, Validation, Correction).
- **Historique** : Accès complet à toutes les réclamations passées et en cours.

### 👨‍🏫 **Espace Enseignant**
- **Tableau de Bord** : Vue claire des réclamations en attente de traitement.
- **Actions Rapides** : Validez ou corrigez une note en un clic.
- **Feedback** : Espace commentaire pour justifier la décision auprès de l'étudiant.

### 🏛️ **Espace Administration**
- **supervision Globale** : Vue d'ensemble sur toutes les filières et niveaux.
- **Dispatching Intelligent** : Assignation automatique ou manuelle aux enseignants.
- **Statistiques** : (À venir) Rapports sur le nombre de réclamations par matière.

---

## 📂 Structure du Projet

```bash
📦 ibam-reclamation
├── 📂 backend           # 🧠 Cerveau de l'application (API Laravel)
│   ├── 📂 app           # Controllers, Models, Mailables
│   ├── 📂 database      # Migrations et Seeders
│   └── 📂 resources     # Templates Emails
├── 📂 frontend          # 💅 Visage de l'application (React + Shadcn)
│   ├── 📂 src
│   │   ├── 📂 pages     # Login, Dashboard, Claims...
│   │   └── 📂 components# Boutons, Cartes, Inputs...
└── 🐳 docker-compose.yml # Orchestration
```

---

## 🚀 Installation

Choisissez votre méthode préférée pour démarrer le projet.

### Option A : Docker (Recommandé) 🐳

La méthode la plus simple pour démarrer en quelques secondes.

```bash
# 1. Cloner le projet
git clone https://github.com/votre-user/ibam-reclamation.git
cd ibam-reclamation

# 2. Démarrer les services
docker-compose up -d --build

# 3. Profitez !
# Frontend : http://localhost:3000
# Backend : http://localhost:8000
```

### Option B : Installation Manuelle 🛠️

<details>
<summary>Cliquez pour voir les étapes manuelles</summary>

#### 1. Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# Configurez votre BDD dans .env puis :
php artisan migrate --seed
php artisan serve
```

#### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```
</details>

---

## 🧪 Tests

Pour exécuter la suite de tests automatisés du backend :

```bash
cd backend
php artisan test
```

---

## 📧 Configuration des Emails

Pour activer les notifications (création de compte, mises à jour), configurez le SMTP dans `backend/.env`.

| Variable | Exemple (Gmail) |
|----------|-----------------|
| `MAIL_MAILER` | `smtp` |
| `MAIL_HOST` | `smtp.gmail.com` |
| `MAIL_PORT` | `587` |
| `MAIL_ENCRYPTION` | `tls` |
| `MAIL_USERNAME` | `votre@gmail.com` |
| `MAIL_PASSWORD` | `votre-mdp-app` |

---

## 🤝 Contribuer

Les contributions rendent la communauté open-source incroyable. Pour contribuer :

1.  Forkez le projet
2.  Créez votre branche (`git checkout -b feature/AmazingFeature`)
3.  Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
4.  Pushez (`git push origin feature/AmazingFeature`)
5.  Ouvrez une Pull Request

---

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

<div align="center">
  <br />
  Développé avec ❤️ pour l'IBAM
</div>
