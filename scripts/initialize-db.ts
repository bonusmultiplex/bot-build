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