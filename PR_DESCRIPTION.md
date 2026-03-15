# Frontend implementation with Gwent-style UI and multiplayer game logic

## Overview
This PR implements the frontend for the Gwent card game with multiplayer support, game lobby system, and authentic Witcher 3 Gwent visual styling. It includes full integration with the backend game engine via Socket.io, proper game flow management, and a polished user interface.

## Changes

### 1. Gwent-style Visual Design
- **Authentic Gwent aesthetics**: Dark medieval theme with wooden board textures, golden accents (#ffd700), and atmospheric gradients
- **Card styling**: Cards feature borders, shadows, hover effects, and pulse animations when selected
- **Board design**: Single board with two halves (opponent top, player bottom) with distinct color coding:
  - Red borders for opponent rows
  - Green borders for player rows
  - Circular score indicators with golden borders for each row (removed row labels)
- **Hand styling**: Cards arranged in arc formation with smooth hover animations and selection effects
- **UI elements**: Styled pass button, turn indicators, score displays, and round information panels

### 2. Multi-card Row Support
- **Multiple allowed rows**: Cards can now be placed on multiple rows (e.g., melee + ranged)
- **Type system update**: Changed `CardData.row: RowId` to `CardData.rows: RowId[]`
- **Backend integration**: Added `allowedRows` field to `CardDto` and mapper to send card placement options
- **Visual feedback**: All valid rows are highlighted when a card is selected

### 3. Game Lobby System
- **Home page**: New landing page with game creation and join functionality
- **Game code system**: 6-digit numeric codes for game identification
- **Create game**: Generates unique game code automatically
- **Join game**: Players can join existing games by entering the code
- **Game state management**: Proper routing between lobby and game screen

### 4. Socket.io Integration
- **Lazy connection**: Socket only connects when user joins a game (prevents premature connections)
- **Player identification**: Backend sends `you_are_player` event to identify which player is "me"
- **State synchronization**: Real-time game state updates via `state_update` events
- **Error handling**: Proper error display and socket disconnection on game leave
- **Player reconnection**: Improved logic for handling player disconnections and reconnections

### 5. Game Flow Management
- **Waiting state**: Game waits for second player before starting
  - Initial game state: `WAITING` instead of `IN_PROGRESS`
  - Game starts only when both players join
  - Visual waiting screen with spinner animation
- **Turn management**: 
  - Turn indicators showing whose turn it is
  - Disabled cards/hand when not player's turn
  - Visual feedback for passed players
- **Round system**: Displays current round and round wins for both players

### 6. Pass Functionality
- **Manual pass**: Players can click "PASUJ" button to pass
- **Auto-pass on empty hand**: When a player runs out of cards, they automatically pass (Gwent rules)
- **Round end**: Round ends when both players pass
- **Visual states**: Clear indication when player/opponent has passed

### 7. Game Board Implementation
- **Single board design**: One board with opponent half (top) and player half (bottom)
- **Row organization**:
  - Opponent: Siege → Ranged → Melee (top to bottom)
  - Player: Melee → Ranged → Siege (top to bottom)
- **Score display**: Circular score indicators on the left side of each row
- **Card placement**: Visual feedback for valid placement rows

### 8. Backend Compatibility
- **Minimal backend changes**: Only mapper and DTO updates (no game logic changes)
- **Added fields**: `allowedRows`, `roundsWon`, and `status` to DTOs
- **Game state status**: Added `status` field to `GameStateDto` for waiting/in-progress states
- **Waiting logic**: Backend checks if both players joined before starting game

## Files Changed
- `apps/frontend/src/app/HomePage.tsx` - New lobby page component
- `apps/frontend/src/app/HomePage.css` - Lobby styling
- `apps/frontend/src/app/App.tsx` - Routing between lobby and game
- `apps/frontend/src/game/game.tsx` - Main game screen with socket integration
- `apps/frontend/src/game/board.tsx` - Board component with opponent/player halves
- `apps/frontend/src/game/Board.css` - Board styling (Gwent theme)
- `apps/frontend/src/game/Hand.css` - Hand styling with arc layout
- `apps/frontend/src/game/Game.css` - Game screen styling
- `apps/frontend/src/game/mappers.ts` - DTO to frontend type mapping
- `apps/frontend/src/game/types.tsx` - Updated types for multiple rows
- `apps/frontend/src/network/socket.ts` - Lazy socket connection logic
- `packages/shared/dto/GameStateDto.ts` - Added `allowedRows`, `roundsWon`, and `status` fields
- `apps/server/src/mappers/GameMapper.ts` - Map `allowedRows` and `roundsWon` to DTO
- `apps/server/src/index.ts` - Waiting state logic, player reconnection handling
- `packages/game-engine/core/GameEngine.ts` - Auto-pass when hand is empty
