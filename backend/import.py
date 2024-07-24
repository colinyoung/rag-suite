# import url from database.yml
import sys
import os
import json
from psycopg import sql
from bs4 import BeautifulSoup as bs4

from lib.dbconnect import connect


def insert_or_get_post(hash, chunk):
    if chunk['id'] in hash:
        return hash[chunk['id']]

    insert_post = sql.SQL(
        "INSERT INTO posts (title, link, content) VALUES ({title}, {link}, {content}) RETURNING id").format(
        title=sql.Literal(chunk['title']),
        link=sql.Literal(chunk['link']),
        content=sql.Literal(chunk['content'])
    )
    cur.execute(insert_post)
    inserted_id = cur.fetchone()[0]
    hash[chunk['id']] = inserted_id
    return inserted_id


script_path = os.path.dirname(os.path.abspath(__file__))
fname = os.path.join(script_path, sys.argv[1])
conn = connect()
cur = conn.cursor()

with open(fname, 'r') as f:
    json = json.load(f)

    seen = {}
    for item in json:
        post_id = insert_or_get_post(seen, item)
        chunk = item['chunk']
        soup = bs4(chunk, 'html.parser')
        content = soup.get_text()

        if len(content) < 10:
            continue

        insert_chunk = sql.SQL(
            "INSERT INTO chunks (post_id, content) VALUES ({post_id}, {content})").format(
            post_id=sql.Literal(post_id),
            content=sql.Literal(content)
        )
        cur.execute(insert_chunk)
        conn.commit()
