from lib.dbconnect import connect

with open('structure.sql', 'r') as f:
    conn = connect()
    cur = conn.cursor()
    queries = f.read()
    print(queries)
    cur.execute(queries)
    conn.commit()
