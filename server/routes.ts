import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { GameManager } from "./game-manager";
import { SlotManager } from "./slot-manager";

export async function registerRoutes(app: Express): Promise<Server> {
  // HTTP server for both Express and WebSocket
  const httpServer = createServer(app);

  // Create WebSocket server on a different path than Vite's HMR
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    // Add WebSocket server options for better error handling
    clientTracking: true,
    perMessageDeflate: false
  });
  
  console.log("WebSocket server initialized on path: /ws");

  // Create game managers
  const gameManager = new GameManager();
  const slotManager = new SlotManager();

  // Add error event handler for the WebSocket server
  wss.on('error', (error) => {
    console.error('WebSocket Server Error:', error);
  });

  // WebSocket connection handler
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('Client connected from:', req.socket.remoteAddress);
    
    // Add client to game managers
    const clientId = gameManager.addClient(ws);
    const slotClientId = slotManager.addClient(ws);
    
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
        } else if (data.type === 'play_slot') {
          slotManager.playSlot(slotClientId, data.amount);
        } else if (data.type === 'get_slot_stats') {
          const stats = slotManager.getStats();
          ws.send(JSON.stringify({
            type: 'slot_stats',
            stats
          }));
        } else if (data.type === 'get_recent_slot_bets') {
          const bets = slotManager.getRecentBets();
          ws.send(JSON.stringify({
            type: 'recent_slot_bets',
            bets
          }));
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
      console.log('Client disconnected');
      gameManager.removeClient(clientId);
      slotManager.removeClient(slotClientId);
    });
  });

  // Start the game loop
  gameManager.startGameLoop();

  return httpServer;
}
