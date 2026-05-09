# DOC_FirebaseJson

**Ficheiro:** [`firebase.json`](../../firebase.json)

```json
{
  "functions": {
    "source": "functions",
    "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run build"]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

## Significado

| Secção | Função |
|--------|--------|
| `functions` | Cloud Functions em pasta [`functions/`](../../functions/); antes do deploy corre `npm run build` dentro de `functions`. |
| `firestore.rules` | Caminho para [`firestore.rules`](../../firestore.rules). |
| `firestore.indexes` | Caminho para [`firestore.indexes.json`](../../firestore.indexes.json). |

**Nota:** este ficheiro é usado pelo **Firebase CLI** (`firebase deploy`). O deploy da app Next na **Vercel** não lê `firebase.json`.
