import yaml
import os
import psycopg2

environment = 'production' if os.environ.get(
    'ENV') == 'production' else 'development'


def parse_env(database):
    return {
        'user': database['username'],
        'password': database['password'],
        'host': database['host'],
        'port': database['port'],
        'dbname': database['database']
    }


def connect(fname='./database.yml'):
    with open(fname, 'r', encoding='utf-8') as f:
        database = yaml.load(f, Loader=yaml.FullLoader)
        env = parse_env(database[environment])

        # connect to database with psycopg2
        conn = psycopg2.connect(**env)
        conn.set_client_encoding('utf-8')
        return conn
