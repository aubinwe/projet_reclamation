# Politique de sécurité (Application Gestion des Réclamations)

Ce document décrit la politique de sécurité implémentée dans l’application.

## 1) Authentification (API Token)

- Le backend est un projet **Laravel**.
- L’authentification API s’appuie sur **Laravel Sanctum**.
- Lors de l’inscription et de la connexion, un jeton est généré via `createToken('auth_token')` et renvoyé au client.
- Le frontend (React) stocke ce jeton dans le navigateur et l’envoie à chaque requête API via l’entête HTTP:

`Authorization: Bearer <token>`

## 2) Protection des routes (Backend)

- Les routes sensibles sont protégées par le middleware:

`auth:sanctum`

- Exemple: les routes `/demandes`, `/matieres`, `/teachers`, `/notifications`, `/user`, etc. ne sont accessibles que si l’utilisateur est authentifié.

## 3) Autorisation (Contrôle d’accès par rôles – RBAC)

- Chaque utilisateur possède un `role_id` pointant sur la table/entité **Role** (`student`, `teacher`, `registrar`, `admin`).
- Les actions sont autorisées en fonction du rôle, mais aussi en fonction de l’état métier (statut de la demande).

Exemples (backend):
- Un **étudiant** voit uniquement ses demandes.
- Un **enseignant** voit les demandes qui lui sont assignées.
- La **scolarité** (registrar) et l’**administration** (admin) ont une visibilité plus large.

## 4) Sécurité des mots de passe

- Les mots de passe sont stockés sous forme **hachée** (ex: `Hash::make(...)`).
- La connexion utilise `Auth::attempt(...)` (comparaison sécurisée avec le hash).

## 5) Validation serveur (Intégrité des données)

- Le backend valide systématiquement les entrées avec `$request->validate([...])`.
- Exemple sur la création d’une demande (`DemandeController@store`):
  - `matiere_id` doit exister
  - fichiers justificatifs restreints (type et taille)
  - notes bornées (ex: `min:0|max:20` quand applicable)

Objectif: empêcher l’injection de données invalides ou manipulées côté client.

## 6) Upload de fichiers

- Les justificatifs sont limités à certains formats (`pdf`, `jpg`, `jpeg`, `png`) et une taille maximale.
- Le fichier est stocké côté serveur via Laravel (storage), et l’URL est exposée via un champ calculé.

## 7) Côté frontend (bonnes pratiques appliquées)

- Les appels API passent par une instance Axios (`frontend/src/lib/axios.ts`).
- Un interceptor ajoute automatiquement l’entête `Authorization` si un token est présent.

## 8) Remarques / limites et recommandations

- Le token est stocké côté client (souvent `localStorage`). Cela simplifie l’API, mais implique que l’application doit éviter les failles **XSS** (sinon un script malveillant pourrait lire le token).
- Pour un niveau de sécurité supérieur, on peut envisager une stratégie basée sur cookies **HttpOnly** (et politique CORS/CSRF adaptée).

---

### Résumé

La sécurité de l’application repose sur:
- **Authentification par jeton (Laravel Sanctum / Bearer Token)**
- **Autorisation par rôles (RBAC) + règles métiers (statuts)**
- **Validation serveur systématique**
- **Hashage des mots de passe**
- **Restriction des uploads**
