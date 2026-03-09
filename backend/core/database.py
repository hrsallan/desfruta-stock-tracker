import sqlite3
import os

db_path = 'backend/data/desfrutastock.db'

if os.path.exists(db_path):
    print("Banco já existe! Nada feito.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sabor TEXT,
        preco_pf REAL,
        preco_cnpj REAL,
        quantidade_kg REAL
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

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vendas (
        venda_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        produto_id INTEGER,
        quantidade_kg REAL,
        tipo TEXT,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    produtos = [
    ("Abacaxi", 28.0, 23.0, 0),
    ("Aba.Hortelã", 30.0, 25.0, 0),
    ("Açaí", 33.0, 30.0, 0),
    ("Acerola", 28.0, 23.0, 0),
    ("Ace.Laranja", 30.0, 25.0, 0),
    ("Amora", 33.0, 30.0, 0),
    ("Cajú", 28.0, 23.0, 0),
    ("Cupuaçú", 33.0, 30.0, 0),
    ("Goiaba", 28.0, 22.0, 0),
    ("Graviola", 28.0, 25.0, 0),
    ("Mam.Laranja", 30.0, 24.0, 0),
    ("Mamão", 28.0, 22.0, 0),
    ("Maracujá", 41.0, 38.0, 0),
    ("Manga", 28.0, 23.0, 0),
    ("Morango", 28.0, 25.0, 0),
    ("Uva", 33.0, 31.0, 0),
    ("Uva.Morango", 31.0, 28.0, 0),
]

    cursor.executemany(
        "INSERT INTO produtos (sabor, preco_pf, preco_cnpj, quantidade_kg) VALUES (?, ?, ?, ?)",
        produtos
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

# Obter relatório de vendas
def obter_relatorio_vendas():
    db_path = 'backend/data/desfrutastock.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    query = """
    SELECT 
        v.venda_id,
        p.sabor,
        v.quantidade_kg,
        v.tipo,
        (v.quantidade_kg * CASE 
            WHEN v.tipo = 'PF' THEN p.preco_pf 
            ELSE p.preco_cnpj 
        END) AS valor_total
    FROM vendas v
    JOIN produtos p ON v.produto_id = p.id
    """
    
    cursor.execute(query)
    resultados = cursor.fetchall()
    conn.close()
    
    return resultados