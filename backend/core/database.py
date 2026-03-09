import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash

db_path = 'backend/data/desfrutastock.db'

if os.path.exists(db_path):
    print("Banco já existe! Nada feito.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS produtos_padrao (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sabor TEXT,
        preco_pf REAL,
        preco_cnpj REAL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS produtos (   
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sabor TEXT,
        quantidade_kg REAL,
        validade DATE
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

# A coluna data é preenchida automaticamente com a data e hora atuais no momento da inserção da venda.
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

    produtos_padrao = [
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
        "INSERT INTO produtos_padrao (sabor, preco_pf, preco_cnpj, quantidade_kg) VALUES (?, ?, ?, ?)",
        produtos_padrao
    )

    conn.commit()
    conn.close()
    print("Banco inicializado com sucesso!")

# Função para registrar usuário
def registrar_usuario(nome, username, password, role):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    # Cria o hash da senha antes de salvar
    pwd_hash = generate_password_hash(password)
    cursor.execute('INSERT INTO users (nome, username, password, role) VALUES (?, ?, ?, ?)', 
                   (nome, username, pwd_hash, role))
    conn.commit()
    conn.close()

# Função para verificar login
def login_usuario(username, password):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('SELECT password FROM users WHERE username = ?', (username,))
    user = cursor.fetchone()
    conn.close()
    
    if user and check_password_hash(user[0], password):
        return True
    return False

# Função para obter o ID do usuário a partir do username
def obter_id_por_username(username):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM users WHERE username = ?", (username,))
    resultado = cursor.fetchone()
    conn.close()
    return resultado[0] if resultado else None


def obter_usuario_por_username(username):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, nome, username, role FROM users WHERE username = ?", (username,))
    resultado = cursor.fetchone()
    conn.close()
    return dict(resultado) if resultado else None

# Função para registrar produto
def registrar_produto(sabor, quantidade_kg, validade):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO produtos (sabor, quantidade_kg, validade) VALUES (?, ?, ?)', (sabor, quantidade_kg, validade))
    conn.commit()
    conn.close()

# Registrar venda
def registrar_venda(user_id, produto_id, quantidade_kg, tipo):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO vendas (user_id, produto_id, quantidade_kg, tipo) VALUES (?, ?, ?, ?)', (user_id, produto_id, quantidade_kg, tipo))
    conn.commit()
    conn.close()

# Obter relatório de vendas
def obter_relatorio_vendas():
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row 
    cursor = conn.cursor()

    query = """
    SELECT v.venda_id, p.sabor, v.quantidade_kg, v.tipo,
           (v.quantidade_kg * CASE WHEN v.tipo = 'PF' THEN p.preco_pf ELSE p.preco_cnpj END) AS valor_total
    FROM vendas v
    JOIN produtos_padrao p ON v.produto_id = p.id
    """
    
    cursor.execute(query)
    resultados = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return resultados
