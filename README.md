## setup

First, add your database url to the `.env` file. You can use the `.env.example` file as a template.

Next, generate your scrapes from your wordpress blog:

```bash
cd backend/scrape
pipenv install
pipenv run python scrape.py
```

Then, run the following commands to set up the database:

```bash
pipenv install
pipenv run python migrate.py
pipenv run python import.py scrape/scrapes/scraped.json
```
