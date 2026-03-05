import sqlite3

conn = sqlite3.connect("desfrutastock.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS produtos (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               sabor TEXT,
               preco_pf REAL,
               preco_cnpj REAL
)
""")

conn.commit()
conn.close()