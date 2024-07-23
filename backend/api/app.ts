import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());



const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

// Initialize PostgreSQL client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
client.connect();

interface SearchRequestBody {
  query: string;
}

client.on('query', (query) => {
    console.log('Executing query:', query.text);
    console.log('With parameters:', query.values);
  });

app.post('/search', async (req: Request, res: Response) => {
  try {
    const { query }: SearchRequestBody = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Vectorize the query using OpenAI API
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    const vector = response.data[0].embedding;
    const vector_db_string = `ARRAY${JSON.stringify(vector)}::vector`;


    
    // Look up nearest neighbors from PostgreSQL vector database
    const nearestNeighborsQuery = `
      with _vectors as (
        select id, source_id, vector
            from public.embeddings e 
        order by 1 - (vector <=> ${vector_db_string})
        limit 5
    )
    select c.id, c.post_id, c.content 
        from public.chunks c 
        join _vectors v
            on v.source_id = c.id
        group by c.id;
    `;

    const result = await client.query(nearestNeighborsQuery);
    

    // Return nearest neighbors as a JSON array
    res.json(result.rows);
  } catch (error) {
    console.error('Error in /search:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
