import sqlite3
import os

db_path = 'backend/data/desfrutastock.db'

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

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        username TEXT,
        password TEXT,
        role TEXT
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


# Login de usuário
def login_usuario(username, password):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username = ? AND password = ?', (username, password))
    user = cursor.fetchone()
    conn.close()
    if user:
        return True
    return False

# Registro de usuário
def registrar_usuario(nome, username, password, role):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO users (nome, username, password, role) VALUES (?, ?, ?, ?)', (nome, username, password, role))
    conn.commit()
    conn.close()
