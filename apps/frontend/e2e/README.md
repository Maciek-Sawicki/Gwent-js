# E2E (Playwright)

```bash
cd apps/frontend
npx playwright test
```

Testy 01–05, 09, 11–13: sam front (Vite). Testy 06, 07, 08, 10: backend Socket.io (np. port 4000). `VITE_SOCKET_URL` ustawia `playwright.config.ts` przy starcie Vite.

```bash
set VITE_SOCKET_URL=http://localhost:4000
npx playwright test
```

## Kontrakt `data-testid` (lobby / kod gry)

Żeby testy z tego katalogu i starsze (`tests/game-engine/e2e/hand.spec.ts`) działały równolegle:

| Element | `data-testid` | Uwagi |
|--------|----------------|--------|
| 6 cyfr kodu w lobby (widoczny) | `loading-game-code-value` | Główny – używany w `helpers.ts` i spec 02, 10 |
| Ten sam kod (alias E2E) | `game-code` | Ukryty wizualnie (`aria-hidden`), ten sam tekst co wyżej |
| Ekran ładowania lobby | `game-loading-screen`, `game-connecting-text`, `waiting-for-player-text` | |

Zmiana lub usunięcie któregoś z powyższych wymaga aktualizacji **obu** zestawów testów.
