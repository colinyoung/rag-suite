import express from "express";

export const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(8000, () => {
  console.log("Example app listening on port 8000!");
});

/*
Express app:

- connects to postgres DB
- optionally spins up a vector database for you with the fields you specify
- provides a REST API for querying the vector store, you could also proxy this
- provides a REST API for querying other tables (sequelize from express, or proxied to your actual API)
- provides utilities for helping copy items from your PG DB to your vector store
*/

/*
Resources:
- https://github.com/pgvector/pgvector
*/
