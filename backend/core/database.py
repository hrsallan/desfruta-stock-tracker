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

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_usuario TEXT,
            user_id INTEGER,
            acao TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
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
    try:
        with sqlite3.connect(db_path) as conn:
            pwd_hash = generate_password_hash(password)
            conn.execute('INSERT INTO users (nome, username, password, role) VALUES (?, ?, ?, ?)', 
                        (nome, username, pwd_hash, role))
    except sqlite3.IntegrityError:
        raise ValueError("Username já existe. Escolha outro.")

# Função para autenticar usuário
def login_usuario(username, password):
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT password FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        return user and check_password_hash(user[0], password)
    
# Função para informações do usuário pelo username
def obter_info_usuario_por_username(username):
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
        porcentagem = (int(disponiveis) / int(total) * 100) if total > 0 else 0
        return {"disponiveis": disponiveis, "total": total, "porcentagem": porcentagem}
        
# Função que verifica a quantidade de kg disponíveis
def verificar_kg_disponiveis():
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT SUM(quantidade_kg) FROM produtos_padrao WHERE disponivel = 1")
        kg_disponiveis = cursor.fetchone()[0] or 0
        return kg_disponiveis
    
# Função para obter a tabela completa de produtos
def tabela_produtos():
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                sabor,
                preco_pf,
                preco_cnpj,
                quantidade_kg,
                disponivel
            FROM produtos_padrao
            ORDER BY sabor ASC
        """)

        produtos = cursor.fetchall()

        return [
            {
                "sabor": produto["sabor"],
                "preco_pf": produto["preco_pf"],
                "preco_cnpj": produto["preco_cnpj"],
                "quantidade_kg": produto["quantidade_kg"],
                "disponivel": produto["disponivel"],
            }
            for produto in produtos
        ]

# Função para cadastrar um novo produto
def cadastrar_produto(sabor, preco_pf, preco_cnpj, quantidade_kg, disponivel):
    with sqlite3.connect(db_path) as conn:
        conn.execute('INSERT INTO produtos_padrao (sabor, preco_pf, preco_cnpj, quantidade_kg, disponivel) VALUES (?, ?, ?, ?, ?)', 
                     (sabor, preco_pf, preco_cnpj, quantidade_kg, disponivel))
        
# Função deletar um produto
def deletar_produto(sabor):
    with sqlite3.connect(db_path) as conn: 
        conn.execute('DELETE FROM produtos_padrao WHERE sabor = ?', (sabor,))
        if conn.total_changes == 0:
            raise ValueError("Produto não encontrado para exclusão.") 
    
# Função para registrar uma ação no log
def registrar_log(nome_usuario, user_id, acao):
    try:
        with sqlite3.connect(db_path) as conn:
            conn.execute('INSERT INTO logs (nome_usuario, user_id, acao) VALUES (?, ?, ?)', 
                        (nome_usuario, user_id, acao))
    except Exception as e:
        print(f"Erro ao registrar log: {e}")

# Função para obter os logs
def obter_logs():
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT nome_usuario, acao, timestamp FROM logs ORDER BY timestamp DESC")
        logs = cursor.fetchall()
        return [dict(log) for log in logs]
    
# Função para deletar os logs
def deletar_logs_totais():
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM logs")
        conn.commit() 
        print(f"Logs deletados com sucesso. Linhas afetadas: {cursor.rowcount}")
    except sqlite3.Error as e:
        print(f"Erro no banco de dados: {e}")
    finally:
        if conn:
            conn.close()
    
# --- Execução ---
if __name__ == "__main__":
    inicializar_banco()