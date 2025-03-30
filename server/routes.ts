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

  // Add another endpoint to match what the client is calling
  app.post("/api/compare-recitation", async (req, res) => {
    try {
      console.log('📊 API /compare-recitation request received:', req.body);
      const { recitedText, referenceText } = req.body;
      
      if (!recitedText) {
        console.log('📊 API Error: Recited text is required');
        return res.status(400).json({ message: "Recited text is required" });
      }
      
      if (!referenceText) {
        console.log('📊 API Error: Reference text is required');
        return res.status(400).json({ message: "Reference text is required" });
      }
      
      console.log('📊 Performing text comparison');
      const comparisonResult = await storage.compareText(recitedText, referenceText);
      
      console.log('📊 Comparison complete, sending response');
      res.json(comparisonResult);
    } catch (error) {
      console.error("Error comparing recitation:", error);
      res.status(500).json({ message: "Error processing recitation" });
    }
  });

  // Compare recited text with reference text
  app.post("/api/japji-sahib/compare", async (req, res) => {
    try {
      console.log('📊 API request received:', req.body);
      const { recognizedText, referenceText: clientReferenceText } = req.body;
      
      if (!recognizedText) {
        console.log('📊 API Error: Recognized text is required');
        return res.status(400).json({ message: "Recognized text is required" });
      }
      
      // Validate input using Zod schema
      const validData = compareRecitation.parse({
        recognizedText,
        referenceText: clientReferenceText
      });
      
      // Get reference text - use client-provided reference if available
      const referenceText = validData.referenceText || storage.getJapjiSahibText();
      console.log('📊 Using reference text:', referenceText.substring(0, 50) + '...');
      
      // Perform text comparison
      console.log('📊 Performing text comparison');
      const comparisonResult = await storage.compareText(
        validData.recognizedText,
        referenceText
      );
      
      console.log('📊 Comparison complete, sending response');
      res.json(comparisonResult);
    } catch (error) {
      console.error("Error comparing recitation:", error);
      res.status(500).json({ message: "Error processing recitation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
