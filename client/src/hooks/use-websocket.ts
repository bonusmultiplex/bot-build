import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  
  const connectSocket = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        setIsConnected(true);
        console.log("WebSocket connected");
      };
      
      socket.onmessage = (event) => {
        setLastMessage(event);
      };
      
      socket.onclose = () => {
        setIsConnected(false);
        console.log("WebSocket disconnected");
        
        // Attempt to reconnect after a delay
        setTimeout(() => {
          console.log("Attempting to reconnect...");
          connectSocket();
        }, 2000);
      };
      
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to game server",
          variant: "destructive",
        });
      };
      
      socketRef.current = socket;
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      toast({
        title: "Connection Error",
        description: "Failed to establish connection to game server",
        variant: "destructive",
      });
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [toast]);
  
  // Connect when component mounts
  useEffect(() => {
    const cleanup = connectSocket();
    
    // Cleanup on unmount
    return cleanup;
  }, [connectSocket]);
  
  // Function to send messages
  const sendMessage = useCallback((message: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    } else {
      console.warn("Cannot send message, WebSocket is not connected");
      toast({
        title: "Connection Error",
        description: "Cannot send message, not connected to game server",
        variant: "destructive",
      });
    }
  }, [toast]);
  
  return { isConnected, lastMessage, sendMessage };
}
