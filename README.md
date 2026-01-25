# TRD (The Real Deal)

Projet de plateforme de paris sportifs distribuée (M2 MIAGE).

## Architecture Technique

Le projet repose sur une architecture **Micro-services distribuée**, conçue pour assurer la scalabilité et la résilience des transactions financières.

### Stack Technologique
* **Runtime :** Node.js (v20)
* **Langage :** TypeScript
* **Framework :** NestJS (Architecture Monorepo)
* **Conteneurisation :** Docker & Docker Compose
* **Base de données :** PostgreSQL (x3 instances isolées)
* **Broker :** RabbitMQ

### Composants et Services
Le système est découpé en domaines métiers étanches (Bounded Contexts) respectant les principes du DDD :

1.  **API Gateway**
    * Point d'entrée unique du système.
    * Gère le routing et agit comme un reverse-proxy vers les services internes.

2.  **Service Identity**
    * Responsable de l'authentification et de la gestion des utilisateurs.
    * Délivre les tokens JWT nécessaires aux appels sécurisés.

3.  **Service Wallet**
    * Gère les comptes utilisateurs et le grand livre (Ledger).
    * **Data Isolation :** Possède sa propre base de données PostgreSQL dédiée.
    * Reçoit les ordres de débit/crédit de manière asynchrone pour garantir la cohérence à terme.

4.  **Service Betting**
    * Gère le catalogue des matchs, les cotes et la validation des paris.
    * **Data Isolation :** Possède sa propre base de données PostgreSQL dédiée.
    * Agit comme "Producteur" d'événements vers le système financier.

5.  **Message Broker (RabbitMQ)**
    * Assure la communication asynchrone et le découplage entre le jeu (Betting) et l'argent (Wallet).
    * Gère les files d'attente pour la prise de pari (`wallet_debit`) et le paiement des gains (`payout_user`).

## Membres de l'équipe

* Wassim EL BAKHTAOUI
* Yanis HAMMOUDA
* Mathis CLAUDEL

## Docker et Déploiement

L'infrastructure est entièrement définie via Docker Compose. Les variables d'environnement sont injectées directement dans le manifeste pour faciliter le déploiement sans configuration manuelle.

### Démarrage

Pour lancer l'environnement complet (Bases de données, RabbitMQ et Services API) :

    # Se placer à la racine du projet
    cd trd_elbakhtaoui_hammouda_claudel

    # Build des images et démarrage des services
    docker compose up --build

    # Optionnel : Démarrage en arrière-plan
    docker compose up -d --build

L'API Gateway est accessible sur : http://localhost:3000

### Arrêt et Nettoyage

    # Arrêter les conteneurs et supprimer les réseaux
    docker compose down

## Structure du Dockerfile

Chaque service utilise une configuration Docker optimisée pour l'environnement Node.js (Multi-stage build) :
* **Base :** Node.js 20-alpine (Image légère)
* **Dépendances :** Installation propre via `npm ci`
* **Build :** Compilation TypeScript via NestJS CLI
* **Runtime :** Exécution optimisée via `node dist/main`

---

## Scénarios de Test et Données

### Données de Test (Fichier Rapide)
Pour peupler la base de données et tester le flux complet (Inscription -> Dépôt -> Match -> Pari -> Gain) sans utiliser de commandes manuelles, un fichier de requêtes HTTP est fourni.

**Voir le fichier : `requests.http` à la racine du projet.**

Il est compatible avec l'extension "REST Client" de VS Code ou IntelliJ et permet de jouer le scénario nominal en un clic.

---

### Endpoints API (Documentation manuelle)

Si vous préférez tester manuellement via le terminal, voici les commandes CURL équivalentes.

#### 1. Inscription (Identity Service)
Crée un utilisateur et retourne son ID.

    curl -X POST http://localhost:3000/identity/register \
    -H "Content-Type: application/json" \
    -d '{"email": "test@trd.com", "password": "password123", "username": "TestUser"}'

*Note : Copiez l'ID retourné pour la suite.*

#### 2. Authentification (Identity Service)
Retourne le Token JWT nécessaire pour les requêtes sécurisées.

    curl -X POST http://localhost:3000/identity/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@trd.com", "password": "password123"}'

*Note : Copiez le `access_token` pour l'utiliser dans le Header `Authorization`.*

#### 3. Dépôt d'argent (Wallet Service)
Crédite le compte du joueur (Nécessite Authentification).
*Remplacer `<UUID_UTILISATEUR>` et `<VOTRE_TOKEN_JWT>`.*

    curl -X POST http://localhost:3000/wallet/<UUID_UTILISATEUR>/deposit \
    -H "Authorization: Bearer <VOTRE_TOKEN_JWT>" \
    -H "Content-Type: application/json" \
    -d '{"amount": 100}'

#### 4. Placer un Pari (Flux Asynchrone)
Le service Betting valide le pari et envoie un événement RabbitMQ au service Wallet pour le débit.
*Remplacer `<UUID_MATCH_RECUPERE>` (via GET /betting/matches), `<UUID_UTILISATEUR>` et `<VOTRE_TOKEN_JWT>`.*

    curl -X POST http://localhost:3000/betting \
    -H "Authorization: Bearer <VOTRE_TOKEN_JWT>" \
    -H "Content-Type: application/json" \
    -d '{
    "matchId": "<UUID_MATCH_RECUPERE>",
    "punterId": "<UUID_UTILISATEUR>",
    "selection": "HOME",
    "stake": 20
    }'

#### 5. Fin de match & Paiement (Flux Asynchrone)
Simule la fin d'un match. Si le pari est gagnant, le Wallet est crédité automatiquement via RabbitMQ.

    curl -X POST http://localhost:3000/betting/matches/<UUID_MATCH>/finish \
    -H "Content-Type: application/json" \
    -d '{"scoreHome": 3, "scoreAway": 0}'

#### 6. Vérification Sécurité (Test d'accès refusé)
Tente d'accéder au portefeuille sans token JWT. Le serveur doit répondre `401 Unauthorized`.

    curl -X GET http://localhost:3000/wallet/<UUID_UTILISATEUR>