const pg = require("pg");
const openai = require("openai");

const namespace = process.argv[3];

if (!namespace) {
  throw new Error("Namespace is required");
}

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
    const chunks = await client.query(
      `SELECT p.id as post_id,
                  p.${loadConfig.column_names.title} as title,
                  p.${loadConfig.column_names.link} as link,
                  p.${loadConfig.column_names.body} as body,
                  c.id as chunk_id,
                  c.content as chunk_content

      FROM ${loadConfig.table_name} AS p
      LEFT JOIN chunks AS c ON c.post_id = p.id
      `
    );
    for (const chunk of chunks.rows) {
      const content = chunk["chunk_content"];
      if (content < 10) {
        continue;
      }
      const embedding = await generateEmbedding(content, config);
      console.log("Embedding generated for", chunk["post_id"], content);
      const sql = `INSERT INTO ${config.embeddings.table_name} (source_id, _namespace, vector) VALUES ($1, $2, $3)`;
      await client.query(sql, [
        chunk["post_id"],
        namespace,
        JSON.stringify(embedding.vector),
      ]);
    }
    await client.end();
  } catch (err) {
    console.error("Error connecting to the database", err);
  }
};

module.exports = handler;

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
