import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { GameManager } from "./game-manager";

export async function registerRoutes(app: Express): Promise<Server> {
  // HTTP server for both Express and WebSocket
  const httpServer = createServer(app);

  // Create WebSocket server on a different path than Vite's HMR
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  // Create game manager
  const gameManager = new GameManager();

  // WebSocket connection handler
  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');
    
    // Add client to game manager
    const clientId = gameManager.addClient(ws);
    
    // Send initial game state
    const initialState = gameManager.getGameState();
    ws.send(JSON.stringify({
      type: 'game_state',
      state: initialState.state,
      gameId: initialState.gameId,
      timeRemaining: initialState.timeRemaining
    }));
    
    // Send stats update
    ws.send(JSON.stringify({
      type: 'stats_update',
      stats: gameManager.getStats()
    }));
    
    // Send multiplier history
    const history = gameManager.getMultiplierHistory();
    for (const multiplier of history) {
      ws.send(JSON.stringify({
        type: 'game_complete',
        finalMultiplier: multiplier
      }));
    }
    
    // Send current multiplier if game is in progress
    if (initialState.state === 'in_progress') {
      ws.send(JSON.stringify({
        type: 'multiplier_update',
        multiplier: gameManager.getCurrentMultiplier()
      }));
    }
    
    // Send recent bets
    const recentBets = gameManager.getRecentBets();
    for (const bet of recentBets) {
      ws.send(JSON.stringify({
        type: 'bet_placed',
        bet
      }));
    }
    
    // Notify client they're connected
    ws.send(JSON.stringify({
      type: 'connected'
    }));
    
    // Handle messages from clients
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'place_bet') {
          gameManager.placeBet(clientId, data.amount, data.targetMultiplier);
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
      console.log('Client disconnected');
      gameManager.removeClient(clientId);
    });
  });

  // Start the game loop
  gameManager.startGameLoop();

  return httpServer;
}
