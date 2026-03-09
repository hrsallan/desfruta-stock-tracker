import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash

db_path = 'backend/data/desfrutastock.db'

# Garante que o diretório exista
os.makedirs(os.path.dirname(db_path), exist_ok=True)

def inicializar_banco():
    if os.path.exists(db_path):
        print("Banco já existe! Pulando inicialização.")
        return

    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        
        # Habilitar chaves estrangeiras
        cursor.execute("PRAGMA foreign_keys = ON")

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS produtos_padrao (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sabor TEXT NOT NULL,
            preco_pf REAL,
            preco_cnpj REAL,
            quantidade_kg REAL DEFAULT 0,
            disponivel INTEGER DEFAULT 0
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
            username TEXT UNIQUE,
            password TEXT,
            role TEXT
        )
        """)

        produtos_padrao = [
            ("Abacaxi", 28.0, 23.0, 0, 0), ("Aba.Hortelã", 30.0, 25.0, 0, 0),
            ("Açaí", 33.0, 30.0, 0, 0), ("Acerola", 28.0, 23.0, 0, 0),
            ("Ace.Laranja", 30.0, 25.0, 0, 0), ("Amora", 33.0, 30.0, 0, 0),
            ("Cajú", 28.0, 23.0, 0, 0), ("Cupuaçú", 33.0, 30.0, 0, 0),
            ("Goiaba", 28.0, 22.0, 0, 0), ("Graviola", 28.0, 25.0, 0, 0),
            ("Mam.Laranja", 30.0, 24.0, 0, 0), ("Mamão", 28.0, 22.0, 0, 0),
            ("Maracujá", 41.0, 38.0, 0, 0), ("Manga", 28.0, 23.0, 0, 0),
            ("Morango", 28.0, 25.0, 0, 0), ("Uva", 33.0, 31.0, 0, 0),
            ("Uva.Morango", 31.0, 28.0, 0, 0)
        ]

        cursor.executemany(
            "INSERT INTO produtos_padrao (sabor, preco_pf, preco_cnpj, quantidade_kg, disponivel) VALUES (?, ?, ?, ?, ?)",
            produtos_padrao
        )
        conn.commit()
        print("Banco inicializado com sucesso!")

# --- Funções ---

# Função para registrar um novo usuário
def registrar_usuario(nome, username, password, role):
    with sqlite3.connect(db_path) as conn:
        pwd_hash = generate_password_hash(password)
        conn.execute('INSERT INTO users (nome, username, password, role) VALUES (?, ?, ?, ?)', 
                     (nome, username, pwd_hash, role))

# Função para autenticar usuário
def login_usuario(username, password):
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT password FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        return user and check_password_hash(user[0], password)
        
# Função para obter o ID do usuário a partir do username
def obter_id_por_username(username):
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM users WHERE username = ?", (username,))
        resultado = cursor.fetchone()
        return resultado[0] if resultado else None

# Função para obter os dados completos do usuário
def obter_usuario_por_username(username):
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT user_id, nome, username, role FROM users WHERE username = ?", (username,))
        resultado = cursor.fetchone()
        return dict(resultado) if resultado else None
    
# Função para verificar quantos produtos estão disponíveis
def verificar_produtos_disponiveis():
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM produtos_padrao WHERE disponivel = 1")
        disponiveis = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM produtos_padrao")
        total = cursor.fetchone()[0]
        return {"disponiveis": disponiveis, "total": total}

# --- Execução ---
if __name__ == "__main__":
    inicializar_banco()