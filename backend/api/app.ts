import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";
import { Client } from "pg";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config({
  path: "../.env",
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize PostgreSQL client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
client.connect();

interface SearchRequestBody {
  query: string;
  topK?: number;
}

client.on("query" as any, (query: any) => {
  console.log("Executing query:", query.text);
  console.log("With parameters:", query.values);
});

app.post("/search", async (req: Request, res: Response) => {
  try {
    const { query, topK = 5 }: SearchRequestBody = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    // Vectorize the query using OpenAI API
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const vector = response.data[0].embedding;

    // Look up nearest neighbors from PostgreSQL vector database
    const nearestNeighborsQuery = `
      with _vectors as (
      select id, source_id, vector, 1 - (vector <=> $1) as similarity
        from public.embeddings e
      order by similarity desc
      limit $2
    )
    select c.id, c.post_id, c.content, v.similarity
      from public.chunks c
      join _vectors v
        on v.source_id = c.id
      order by v.similarity desc
    `;

    const result = await client.query(nearestNeighborsQuery, [
      JSON.stringify(vector),
      topK,
    ]);

    // Return nearest neighbors as a JSON array
    res.json(result.rows);
  } catch (error) {
    console.error("Error in /search:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
