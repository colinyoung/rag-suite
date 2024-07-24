## setup

First, add your database url to the `.env` file. You can use the `.env.example` file as a template.

Next, generate your scrapes from your wordpress blog:

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
node cli.js load
```

Finally, run the backend server:

```bash
cd backend/api
npm install
npx ts-node app.ts
```
