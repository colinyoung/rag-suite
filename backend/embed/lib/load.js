const { Client } = require("pg");
const _ = require("lodash");

// Retrieve the DATABASE_URL from the environment variables
const connectionString = process.env.DATABASE_URL;

// Create a new PostgreSQL client
const client = new Client({
  connectionString,
});

const defaultConfig = Object.freeze(require("./config.default.json"));

// Connect to the database
const handler = async (overrides) => {
  try {
    await client.connect();

    const config = _.defaultsDeep(overrides, defaultConfig.load);

    // iterate all posts
    const posts = await client.query(
      `SELECT id, ${config.column_names.title} as title, ${config.column_names.link} as link, ${config.column_names.body} as body FROM ${config.table_name}`
    );

    posts.rows.forEach(async (post) => {
      // perform chunking
      const chunks = chunkPost(post, config.chunk_max_length);
      generateEmbeddings(chunks);
    });
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

function generateEmbeddings(chunks) {
  chunks.forEach((chunk) => {});
}
