# SEC — firestore.rules (territories)

**Severidade:** MÉDIO (aceite por desenho)

**Problema:** `territories` com `read: if true` — qualquer cliente autenticado ou anónimo lê metadados.

**Risco:** Exposição de geometrias e stats; custo de leitura.

**Mitigação actual:** Escrita apenas via Admin SDK nas APIs; listener filtra status activos.

**Data:** 2026-05-19
