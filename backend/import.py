# import url from database.yml
import sys
import os
import json
from psycopg import sql

from lib.dbconnect import connect

conn = connect()
cur = conn.cursor()

script_path = os.path.dirname(os.path.abspath(__file__))
fname = os.path.join(script_path, sys.argv[1])
with open(fname, 'r') as f:
    json = json.load(f)

    for item in json:
        insert_post = sql.SQL(
            "INSERT INTO posts (title, link, content) VALUES ({title}, {link}, {content}) RETURNING id").format(
            title=sql.Literal(item['title']),
            link=sql.Literal(item['link']),
            content=sql.Literal('\n'.join(item['content']))
        )
        cur.execute(insert_post)
        inserted_id = cur.fetchone()[0]
        for chunk in item['content']:
            insert_chunk = sql.SQL(
                "INSERT INTO chunks (post_id, content) VALUES ({post_id}, {content})").format(
                post_id=sql.Literal(inserted_id),
                content=sql.Literal(chunk)
            )
            cur.execute(insert_chunk)
    conn.commit()
