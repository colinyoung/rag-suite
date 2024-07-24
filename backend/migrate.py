import sys
from lib.dbconnect import connect

if len(sys.argv) < 2:
    raise Exception('Argument 0 must be up or down')

if sys.argv[1] == 'up':
    fname = 'structure_up.sql'
elif sys.argv[1] == 'down':
    fname = 'structure_down.sql'
else:
    raise Exception('Argument 0 must be up or down')

with open(fname, 'r') as f:
    print(fname)
    conn = connect()
    cur = conn.cursor()
    queries = f.read()
    print(queries)
    cur.execute(queries)
    conn.commit()
