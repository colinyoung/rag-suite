# RAG Suite

Everything you need to get RAG into your application as quick as possible. Go from Wordpress blog posts to a fully functional RAG system in minutes.

## Demo Video

[![RAG Suite Demo](https://img.youtube.com/vi/VMy1bK1s92A/0.jpg)](https://youtu.be/VMy1bK1s92A)

## Setup

First, add your database url to the `.env` file or set it in your environment. You can use the `.env.example` file as a template.

Next, generate your chunks (to be embedded later) from your wordpress blog:

```bash
cd backend/scrape
pipenv install
pipenv run python scrape.py https://your-wordpress-blog.com/feed/
```

Then, run the following commands to set up the database:

```bash
pipenv install
pipenv run python migrate.py up
pipenv run python import.py scrape/scrapes/scraped.json
```

Run the node cli to load embeddings for your imported data:

```bash
cd backend/embed
npm install
npm run load posts # The last argument is a "namespace", which is used to separate embeddings for different types of data
```

Finally, run the backend server:

```bash
cd backend/api
npm install
npm run dev
```
