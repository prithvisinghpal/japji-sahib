import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { compareRecitation } from "../shared/schema";
import { japjiSahibText } from "../shared/japjiSahibText";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get the full Japji Sahib text
  app.get("/api/japji-sahib/text", (req, res) => {
    try {
      const referenceText = storage.getJapjiSahibText();
      res.json(referenceText);
    } catch (error) {
      console.error("Error fetching Japji Sahib text:", error);
      res.status(500).json({ message: "Error fetching reference text" });
    }
  });

  // Compare recited text with reference text
  app.post("/api/japji-sahib/compare", async (req, res) => {
    try {
      const { recognizedText } = req.body;
      
      if (!recognizedText) {
        return res.status(400).json({ message: "Recognized text is required" });
      }
      
      // Validate input using Zod schema
      const validData = compareRecitation.parse({
        recognizedText,
      });
      
      // Get reference text
      const referenceText = storage.getJapjiSahibText();
      
      // Perform text comparison
      const comparisonResult = await storage.compareText(
        validData.recognizedText,
        referenceText
      );
      
      res.json(comparisonResult);
    } catch (error) {
      console.error("Error comparing recitation:", error);
      res.status(500).json({ message: "Error processing recitation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
