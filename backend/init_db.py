import os
import sqlite3

db_path = "backend/desfrutastock_example.db"

if os.path.exists(db_path):
    print("Banco já existe! Nada feito.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sabores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sabor TEXT,
        preco_pf REAL,
        preco_cnpj REAL
    )
    """)

    sabores = [
    ("Abacaxi", 28.0, 23.0),
    ("Aba.Hortelã", 30.0, 25.0),
    ("Açaí", 33.0, 30.0),
    ("Acerola", 28.0, 23.0),
    ("Ace.Laranja", 30.0, 25.0),
    ("Amora", 33.0, 30.0),
    ("Cajú", 28.0, 23.0),
    ("Cupuaçú", 33.0, 30.0),
    ("Goiaba", 28.0, 22.0),
    ("Graviola", 28.0, 25.0),
    ("Mam.Laranja", 30.0, 24.0),
    ("Mamão", 28.0, 22.0),
    ("Maracujá", 41.0, 38.0),
    ("Manga", 28.0, 23.0),
    ("Morango", 28.0, 25.0),
    ("Uva", 33.0, 31.0),
    ("Uva.Morango", 31.0, 28.0),
]

    cursor.executemany(
        "INSERT INTO sabores (sabor, preco_pf, preco_cnpj) VALUES (?, ?, ?)",
        sabores
    )

    conn.commit()
    conn.close()
    print("Banco inicializado com sucesso!")