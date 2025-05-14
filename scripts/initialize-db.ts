import { db } from "../server/db";
import { insertSlotSymbolSchema, slotSymbols, slotPaylines, insertSlotPaylineSchema } from "../shared/schema";

async function initializeDatabase() {
  console.log("Initializing database with slot symbols and paylines...");

  // Define slot symbols
  const symbols = [
    {
      name: "Bar",
      symbol: "bar",
      multiplier: 2.0,
      imagePath: "/assets/sbar.png",
    },
    {
      name: "Bell",
      symbol: "bell",
      multiplier: 3.0,
      imagePath: "/assets/sbell.png",
    },
    {
      name: "Cherry",
      symbol: "cherry",
      multiplier: 1.5,
      imagePath: "/assets/scherry.png",
    },
    {
      name: "Diamond",
      symbol: "diamond",
      multiplier: 10.0,
      imagePath: "/assets/sdiamond.png",
    },
    {
      name: "Heart",
      symbol: "heart",
      multiplier: 2.5,
      imagePath: "/assets/sheart.png",
    },
    {
      name: "Lemon",
      symbol: "lemon",
      multiplier: 1.2,
      imagePath: "/assets/slemon.png",
    },
    {
      name: "Melon",
      symbol: "melon",
      multiplier: 2.0,
      imagePath: "/assets/smelon.png",
    },
    {
      name: "Seven",
      symbol: "seven",
      multiplier: 15.0,
      imagePath: "/assets/sseven.png",
    },
    {
      name: "Shoe",
      symbol: "shoe",
      multiplier: 1.8,
      imagePath: "/assets/sshoe.png",
    },
  ];

  // Define paylines
  const paylines = [
    {
      name: "Horizontal Top",
      positions: [0, 1, 2],
      multiplier: 1.0,
    },
    {
      name: "Horizontal Middle",
      positions: [3, 4, 5],
      multiplier: 1.0,
    },
    {
      name: "Horizontal Bottom",
      positions: [6, 7, 8],
      multiplier: 1.0,
    },
    {
      name: "Diagonal Down",
      positions: [0, 4, 8],
      multiplier: 1.5,
    },
    {
      name: "Diagonal Up",
      positions: [6, 4, 2],
      multiplier: 1.5,
    },
  ];

  // Initialize game types
  const gameTypes = [
    {
      name: "blackjack",
      description: "Classic card game of 21",
      minBet: 100,
      maxBet: 100000,
      odds: 1.5, // 3:2
      hardModeOdds: 2.0, // 2:1
      hasHardMode: true,
      xpReward: 100
    },
    {
      name: "coinflip",
      description: "50/50 heads or tails",
      minBet: 100,
      maxBet: 100000,
      odds: 1.0, // 1:1
      hasHardMode: false,
      xpReward: 100
    },
    {
      name: "crash", 
      description: "Increasing multiplier until crash",
      minBet: 100,
      maxBet: 100000,
      odds: 1.0, // Variable based on timing
      hasHardMode: true,
      xpReward: 100
    },
    {
      name: "slots",
      description: "Classic slot machine",
      minBet: 100, 
      maxBet: 100000,
      odds: 500.0, // Up to 500:1
      hasHardMode: false,
      xpReward: 100
    },
    {
      name: "roulette",
      description: "Classic casino roulette",
      minBet: 100,
      maxBet: 100000,
      odds: 35.0, // Up to 35:1 for single numbers
      hasHardMode: false, 
      xpReward: 100
    }
  ];

  // Initialize boosts
  const boosts = [
    {
      name: "XP Boost",
      description: "Increases XP gained by 50%",
      type: "xp",
      multiplier: 1.5,
      duration: 60, // 1 hour
      price: 1000,
    },
    {
      name: "Cash Boost",
      description: "Increases cash rewards by 25%", 
      type: "cash",
      multiplier: 1.25,
      duration: 60,
      price: 2000,
    },
    {
      name: "Win Rate Boost",
      description: "Increases win rate by 10%",
      type: "win_rate", 
      multiplier: 1.1,
      duration: 30,
      price: 5000,
    }
  ];

  // Initialize items
  const shopItems = [
    {
      name: "Lucky Coin",
      description: "Small chance to double winnings",
      type: "collectible",
      price: 1000,
      sellPrice: 500,
      rarity: "common",
      imagePath: "/assets/items/lucky_coin.png"
    },
    {
      name: "Experience Scroll",
      description: "Instantly grants 1000 XP when used",
      type: "consumable", 
      price: 2000,
      sellPrice: 1000,
      rarity: "rare",
      imagePath: "/assets/items/xp_scroll.png"
    },
    {
      name: "Golden Ticket",
      description: "Free entry to any game",
      type: "consumable",
      price: 5000,
      sellPrice: 2500, 
      rarity: "epic",
      imagePath: "/assets/items/golden_ticket.png"
    }
  ];

  // Initialize command help
  const commands = [
    {
      name: "help",
      description: "Show help for all available commands",
      category: "general",
      aliases: ["h", "wtf"],
      examples: ["help", "help connectFour", "help c4"]
    },
    {
      name: "donate", 
      description: "Support the bot's development",
      category: "general",
      aliases: [],
      examples: ["donate", "donate paypal", "donate patreon"]
    },
    {
      name: "deleteMyData",
      description: "Delete all your data from the bot",
      category: "account",
      aliases: [],
      examples: ["deleteMyData"]
    },
    {
      name: "stats",
      description: "Show bot statistics and status",
      category: "general", 
      aliases: ["ping", "status", "about", "info"],
      examples: ["stats"]
    },
    {
      name: "invite",
      description: "Get bot invite link",
      category: "general",
      aliases: [],
      examples: ["invite"]
    },
    {
      name: "support",
      description: "Join the support server",
      category: "general",
      aliases: [],
      examples: ["support"]
    }
  ];

  try {
    // Insert symbols
    for (const symbol of symbols) {
      const validatedSymbol = insertSlotSymbolSchema.parse(symbol);
      if (!db) {
        throw new Error("Database connection is not initialized.");
      }
      await db.insert(slotSymbols).values(validatedSymbol);
    }
    console.log("Slot symbols inserted successfully");

    // Insert paylines
    for (const payline of paylines) {
      const validatedPayline = insertSlotPaylineSchema.parse(payline);
      if (!db) {
        throw new Error("Database connection is not initialized.");
      }
      await db.insert(slotPaylines).values(validatedPayline);
    }
    console.log("Paylines inserted successfully");

    // Insert game types
    await db.insert(gameTypes).values(gameTypes);
    console.log("Game types inserted successfully");

    // Insert boosts
    for (const boost of boosts) {
      const validatedBoost = insertBoostSchema.parse(boost);
      await db.insert(boosts).values(validatedBoost);
    }
    console.log("Boosts inserted successfully");

    // Insert items
    for (const item of shopItems) {
      const validatedItem = insertItemSchema.parse(item);
      await db.insert(items).values(validatedItem);
    }
    console.log("Shop items inserted successfully");

    // Insert commands
    for (const command of commands) {
      const validatedCommand = insertCommandHelpSchema.parse(command);
      await db.insert(commandHelp).values(validatedCommand);
    }
    console.log("Commands inserted successfully");

    // Initialize bot stats
    await db.insert(botStats).values({
      playerCount: 0,
      guildCount: 0,
      activeGames: 0,
      commandsRun: 0,
      uptime: 0
    });
    console.log("Bot stats initialized successfully");

    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });