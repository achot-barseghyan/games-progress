# 🔒 Sécurité des Clés API

## ⚠️ IMPORTANT : Protection des Secrets

Ce projet utilise plusieurs clés API qui **NE DOIVENT JAMAIS** être commitées sur GitHub :

- 🔥 **Firebase API Key**
- 🎮 **Steam Web API Key**
- 🎯 **IGDB Client ID & Secret**

## 🛡️ Configuration Sécurisée

### 1. Fichier `config.js` (IGNORÉ par Git)

```javascript
// Votre vraie configuration (PAS sur GitHub)
window.STEAM_CONFIG = {
    apiKey: "F96D2DE732C828A7B4296CBFF20064A0", // Votre vraie clé
    baseUrl: "https://api.steampowered.com"
}

window.IGDB_CONFIG = {
    clientId: "votre_client_id",
    secret: "votre_secret"
}

window.FIREBASE_CONFIG = {
    apiKey: "votre_firebase_key",
    // ... autres configs
}
```

### 2. Fichier `.env.example.js` (SUR GitHub)

```javascript
// Template public (sans vraies clés)
window.STEAM_CONFIG = {
    apiKey: "TON_STEAM_API_KEY", // Template
    baseUrl: "https://api.steampowered.com"
}
```

## 🚀 Installation pour d'autres développeurs

1. **Cloner le repo**
   ```bash
   git clone https://github.com/votre-username/games-progress.git
   ```

2. **Copier le template**
   ```bash
   cp .env.example.js config.js
   ```

3. **Ajouter vos vraies clés dans `config.js`**
   - Steam API Key : https://steamcommunity.com/dev/apikey
   - IGDB : https://api.igdb.com/
   - Firebase : https://console.firebase.google.com/

## 🔐 Fichiers Protégés (.gitignore)

```
# Variables d'environnement - SECRETS
config.js
.env
.env.local
.env.production

# Fichiers de test avec clés
test-steam.html
```

## ⚠️ Que Faire si Vous Avez Accidentellement Commité des Clés

1. **Changez immédiatement vos clés API**
2. **Supprimez le fichier de l'historique Git** :
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch config.js' --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push** (ATTENTION : destructif)
   ```bash
   git push origin --force --all
   ```

## 🎯 Clés API Nécessaires

| Service | Où obtenir | Utilisation |
|---------|------------|-------------|
| Steam Web API | [steamcommunity.com/dev](https://steamcommunity.com/dev/apikey) | Heures de jeu |
| IGDB | [api.igdb.com](https://api.igdb.com/) | Métadonnées jeux |
| Firebase | [console.firebase.google.com](https://console.firebase.google.com/) | Sync cloud |

## 🔗 Variables d'Environnement Alternatives

Pour le déploiement (Vercel, Netlify, etc.), utilisez les variables d'environnement :

- `STEAM_API_KEY`
- `IGDB_CLIENT_ID`
- `IGDB_SECRET`
- `FIREBASE_API_KEY`

---

**🚨 RAPPEL : Ne jamais commiter `config.js` !**