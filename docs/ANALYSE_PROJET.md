# Analyse du projet — IBAM (Gestion des réclamations)

## 1) Objectif et périmètre

Le projet **IBAM – Système de Gestion des Réclamations** est une application web permettant aux étudiants de soumettre des réclamations (principalement autour des notes) et aux services pédagogiques de les traiter selon un circuit de validation.

- **Cible**: Institut Burkinabé des Arts et Métiers (IBAM).
- **Domaine métier**: réclamations / demandes de correction, suivi de statuts, notifications, gestion de matières/enseignants/utilisateurs.

## 2) Stack technique

### 2.1 Backend

- **Framework**: Laravel **12**
- **Langage**: PHP **>= 8.2**
- **Auth API**: **Laravel Sanctum** (Bearer tokens)
- **Base de données**: **MySQL 8** (via Docker Compose)
- **Outils**: Composer, PHPUnit

Fichiers de référence:
- `backend/composer.json`
- `backend/routes/api.php`
- `backend/README.md`

### 2.2 Frontend

- **Framework**: React 18
- **Build tool**: Vite
- **UI**: TailwindCSS + shadcn/ui (Radix UI)
- **Routing**: `react-router-dom`
- **Data fetching**: Axios + TanStack Query

Fichiers de référence:
- `frontend/package.json`
- `frontend/src/App.tsx`
- `frontend/src/lib/axios.ts`
- `frontend/src/context/AuthContext.tsx`

### 2.3 Infrastructure / Dev

- **Docker Compose**: orchestration backend + nginx + mysql + frontend
- Ports principaux:
  - **Frontend**: `http://localhost:3000`
  - **Backend (Nginx)**: `http://localhost:8000`
  - **MySQL**: `localhost:3307`

Fichier de référence:
- `docker-compose.yml`

## 3) Architecture globale (vue d’ensemble)

Le dépôt est organisé en 2 applications principales:

- `backend/` : API REST Laravel (et potentiellement assets Vite côté Laravel, mais le frontend SPA est dans `frontend/`).
- `frontend/` : SPA React consommant l’API Laravel.

### 3.1 Flux de communication

- Le frontend consomme le backend via HTTP (JSON) sur le préfixe `/api`.
- Authentification par token: le frontend stocke un token et le renvoie sur chaque requête.

Exemple côté frontend (Axios):
- `frontend/src/lib/axios.ts` fixe `baseURL` à `http://127.0.0.1:8000/api`
- un interceptor ajoute `Authorization: Bearer <token>` si présent.

## 4) Analyse fonctionnelle

### 4.1 Acteurs (rôles)

Les rôles principaux (seedés) sont:
- `student` (étudiant)
- `registrar` (service scolarité)
- `teacher` (enseignant)
- `admin` (administration / directeur académique)

Source:
- `backend/database/seeders/DatabaseSeeder.php`
- table `roles` via migration `backend/database/migrations/0001_01_01_000001_create_roles_table.php`

### 4.2 Parcours et pages (SPA)

Routes principales dans `frontend/src/App.tsx`:
- `/` : login
- `/register` : inscription
- `/forgot-password` / `/reset-password` : réinitialisation mot de passe
- `/dashboard`
- `/claims` / `/claims/new` / `/claims/:id` : demandes (réclamations)
- `/notifications`
- `/grades`
- `/users`
- `/teachers`
- `/subjects`

### 4.3 Circuit de traitement d’une demande (workflow)

Les statuts métier observés (enum DB) sur `demandes.statut`:
- `SOUMISE`
- `RECUE_SCOLARITE`
- `REJETEE_SCOLARITE`
- `ENVOYEE_DA`
- `IMPUTEE_ENSEIGNANT`
- `VALIDEE`
- `NON_VALIDEE`

Source:
- `backend/database/migrations/2025_12_26_120611_create_demandes_table.php`
- logique applicative (extraits): `backend/app/Http/Controllers/DemandeController.php`

Un flux typique:
1. **Étudiant** crée une demande (`SOUMISE`).
2. **Scolarité** reçoit/valide la réception (`RECUE_SCOLARITE`) ou rejette (`REJETEE_SCOLARITE`).
3. **Scolarité** peut transférer au **DA** (`ENVOYEE_DA`).
4. **DA/Admin** assigne à un **enseignant** (`IMPUTEE_ENSEIGNANT`).
5. **Enseignant** corrige/valide, la demande devient `VALIDEE` (ou `NON_VALIDEE`).
6. Des **notifications** et un **historique** tracent le processus.

Remarque: certains endpoints existent et la logique exacte dépend du rôle + statut (contrôle dans le controller).

## 5) API Backend (points d’entrée)

### 5.1 Auth

Routes publiques:
- `POST /api/register`
- `POST /api/login`
- `POST /api/forgot-password`
- `POST /api/reset-password`

Routes protégées (`auth:sanctum`):
- `POST /api/logout`
- `GET /api/user`

Source:
- `backend/routes/api.php`
- `backend/app/Http/Controllers/AuthController.php`

### 5.2 Demandes (réclamations)

Sous middleware `auth:sanctum`:
- `Route::apiResource('demandes', DemandeController::class)`
- Actions métier:
  - `POST /api/demandes/{id}/valider`
  - `POST /api/demandes/{id}/rejeter`
  - `POST /api/demandes/{id}/envoyer-au-da`
  - `POST /api/demandes/{id}/imputer`
  - `POST /api/demandes/{id}/corriger`

Source:
- `backend/routes/api.php`
- `backend/app/Http/Controllers/DemandeController.php`

### 5.3 Référentiels / administration

Sous middleware `auth:sanctum`:
- `matieres` (CRUD)
- `teachers` (liste/ajout + assign/unassign matières)
- `users` (liste/ajout/suppression)
- `notifications` (liste + marquer comme lue)

Routes publiques (dans `api.php`):
- `GET /api/roles`
- `GET /api/filieres`

## 6) Modèle de données (synthèse)

### 6.1 Tables principales

- `roles`:
  - `id`, `name`

- `filieres`:
  - (structure exacte dans `0001_01_01_000000_create_filieres_table.php`)

- `users`:
  - `name`, `email`, `password`, `role_id`, `filiere_id`

- `matieres`:
  - (structure exacte dans `2025_12_26_120518_create_matieres_table.php`)

- `demandes`:
  - identité étudiant (`nom_prenom`, `filiere_niveau`)
  - relations: `user_id`, `matiere_id`, `enseignant_id` (nullable)
  - contenu: `objet`, `objectif`, `motif`, `justification`
  - workflow: `statut`
  - champs additionnels via migrations ultérieures (ex: commentaires, note_finale, enseignant_nom)

- `notifications`:
  - `user_id`, `message`, `type`, `read_at`, `demande_id?`

- `historique_actions`:
  - `demande_id`, `user_id`, `action`, `details?`

### 6.2 Modèles Eloquent notables

- `App\Models\Demande`:
  - relation vers `user`, `matiere`, `enseignant`, `historiques`
  - expose `justification_url` via `appends`

Source:
- `backend/app/Models/*.php`

## 7) Sécurité (constats)

### 7.1 Authentification

- Utilisation de Sanctum + tokens (`createToken('auth_token')`).
- Les routes sensibles sont regroupées sous `Route::middleware('auth:sanctum')`.

Source:
- `backend/app/Http/Controllers/AuthController.php`
- `backend/routes/api.php`
- `backend/config/sanctum.php`
- `docs/securite/POLITIQUE_SECURITE.md`

### 7.2 Autorisation (RBAC + règles métier)

- Le contrôle d’accès est (au moins partiellement) géré au niveau des controllers en fonction:
  - du rôle (`$user->role->name`)
  - du statut de la demande (`$demande->statut`)

### 7.3 Validation des entrées

- Validation serveur via `$request->validate()` (ex: `DemandeController@store`).
- Upload justificatifs restreint (format + taille).

### 7.4 Point d’attention: stockage du token côté frontend

- Le token est stocké via `localStorage` (dans `AuthContext.tsx`).
- Risque principal: **XSS** (lecture du token).

Recommandations possibles:
- renforcer la protection XSS (CSP, sanitation, dépendances, etc.)
- envisager une auth via cookies `HttpOnly` + CSRF (si le besoin de sécurité l’impose).

## 8) Déploiement / exécution

### 8.1 Docker (recommandé)

- `docker-compose up -d --build`
- Services: `app` (Laravel), `webserver` (Nginx), `db` (MySQL), `frontend` (Vite)

Source:
- `docker-compose.yml`

### 8.2 Sans Docker

Backend:
- `composer install`
- `cp .env.example .env`
- `php artisan key:generate`
- `php artisan migrate --seed`
- `php artisan serve`

Frontend:
- `npm install`
- `npm run dev`

Source:
- `README_utf8.md`
- `backend/README.md`

## 9) Tests et qualité

- Tests backend: `php artisan test` / PHPUnit.
- Tests frontend: non observés dans le dépôt via fichiers dédiés (à confirmer).

## 10) Observations et recommandations d’amélioration

- **Config API côté frontend**: `frontend/src/lib/axios.ts` utilise une URL en dur (`http://127.0.0.1:8000/api`).
  - Reco: utiliser `import.meta.env.VITE_API_URL` (déjà présent au niveau Docker Compose) pour faciliter staging/prod.
- **Autorisation**:
  - Reco: centraliser via Policies / Gates Laravel (plus maintenable et testable), plutôt que disperser dans les controllers.
- **Workflow**:
  - Reco: formaliser les transitions de statuts (state machine / service dédié) et ajouter des tests sur transitions.
- **Sécurité token**:
  - Reco: CSP + audit dépendances + éventuellement cookies HttpOnly selon criticité.
- **Logs**:
  - Reco: exploiter `storage/logs` / niveaux de log et ne pas versionner des logs applicatifs (si présents ailleurs).

---

## Annexes

### A) Fichiers et dossiers importants

- Racine
  - `docker-compose.yml`
  - `docker-nginx.conf`
  - `README_utf8.md`
- Backend
  - `backend/routes/api.php`
  - `backend/app/Http/Controllers/*`
  - `backend/app/Models/*`
  - `backend/database/migrations/*`
  - `backend/database/seeders/*`
- Frontend
  - `frontend/src/App.tsx`
  - `frontend/src/context/AuthContext.tsx`
  - `frontend/src/lib/axios.ts`

