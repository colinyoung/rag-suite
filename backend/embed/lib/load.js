const pg = require("pg");
const openai = require("openai");
const _ = require("lodash");

// Retrieve the DATABASE_URL from the environment variables
const connectionString = process.env.DATABASE_URL;

// Create a new PostgreSQL client
const client = new pg.Client({
  connectionString,
});

const openaiClient = new openai.OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Connect to the database
const handler = async (config) => {
  try {
    await client.connect();

    const loadConfig = config.load;

    // iterate all posts
    const posts = await client.query(
      `SELECT id, ${loadConfig.column_names.title} as title, ${loadConfig.column_names.link} as link, ${loadConfig.column_names.body} as body FROM ${loadConfig.table_name}`
    );

    for (const post of posts.rows) {
      // perform chunking
      const chunks = chunkPost(post, loadConfig.chunk_max_length);
      for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk, config);
        const sql = `INSERT INTO ${config.embeddings.table_name} (source_id, _namespace, vector) VALUES ($1, $2, $3)`;
        await client.query(sql, [
          post.id,
          "posts",
          JSON.stringify(embedding.vector),
        ]);
      }
    }
    await client.end();
  } catch (err) {
    console.error("Error connecting to the database", err);
  }
};

module.exports = handler;

function chunkPost(post, max_length) {
  const chunks = [];
  let currentChunk = "";
  post.body.split("\n").forEach((line) => {
    if (currentChunk.length + line.length <= max_length) {
      currentChunk += line + "\n";
    } else {
      chunks.push(currentChunk);
      currentChunk = line + "\n";
    }
  });
  if (currentChunk.length > 0 && currentChunk !== "\n") {
    chunks.push(currentChunk);
  }
  return chunks;
}

async function generateEmbedding(chunk, options) {
  // openai generate embeddings and return vectors
  const embedding = await openaiClient.embeddings.create({
    model: options.embeddings.model,
    input: chunk,
  });
  return {
    vector: embedding.data[0].embedding,
  };
}
