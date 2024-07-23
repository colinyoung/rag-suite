import os
import psycopg
import dotenv

dotenv.load_dotenv()


def parse_env(url):
    return psycopg.conninfo.conninfo_to_dict(url)


def connect(database_url=os.environ.get('DATABASE_URL')):
    env = parse_env(database_url)

    # connect to database with psycopg
    conn = psycopg.connect(**env)
    return conn
