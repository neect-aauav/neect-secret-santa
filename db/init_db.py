from db_handler import connect

connection = connect()

# create table
with open('schema.sql') as f:
    connection.executescript(f.read())

connection.close()