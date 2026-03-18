import sqlite3
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone, timedelta

load_dotenv()  # Carrega as variáveis de ambiente do arquivo .env

db_path = 'backend/data/desfrutastock.db'
senhadaporra = os.getenv("SENHA_MASTER")
pass_jwt = generate_password_hash(senhadaporra) if senhadaporra else None

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
            role TEXT,
            empresa TEXT,
            data_criacao DATETIME DEFAULT (datetime('now', '-3 hours')),
            ultimo_acesso DATETIME
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_usuario TEXT,
            user_id INTEGER,
            acao TEXT,
            timestamp DATETIME DEFAULT (datetime('now', '-3 hours')),
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS movimentacoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sabor TEXT,
                quantidade_kg REAL,
                validade TEXT,
                acao TEXT,
                tipo TEXT,
                data DATETIME DEFAULT (datetime('now', '-3 hours'))
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

        usuarios_padrao = [
            ("devallan", pass_jwt, "Allan Silva", "desenvolvedor", "Desfruta Polpas"),
            ("devogura", pass_jwt, "Gabriel Ogura", "desenvolvedor", "Desfruta Polpas")
        ]

        cursor.executemany(
            "INSERT INTO users (username, password, nome, role, empresa) VALUES (?, ?, ?, ?, ?)",
            usuarios_padrao
        )
        conn.commit()
        print("Banco inicializado com sucesso!")

# --- Funções ---

# Função para registrar um novo usuário
def registrar_usuario(nome, username, password, role, empresa):
    try:
        with sqlite3.connect(db_path) as conn:
            pwd_hash = generate_password_hash(password)
            conn.execute('INSERT INTO users (nome, username, password, role, empresa) VALUES (?, ?, ?, ?, ?)', 
                        (nome, username, pwd_hash, role, empresa))
    except sqlite3.IntegrityError:
        raise ValueError("Username já existe. Escolha outro.")

# Função para autenticar usuário
def login_usuario(username, password):
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT password FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        return user and check_password_hash(user[0], password)
    
# Função Atualizar o último acesso do usuário
def atualizar_ultimo_acesso(username):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        br_time = datetime.now(timezone(timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute("UPDATE users SET ultimo_acesso = ? WHERE username = ?", (br_time, username))
        conn.commit()
    except sqlite3.Error as e:
        print(f"Erro ao atualizar último acesso: {e}")
    finally:
        if conn:
            conn.close()
    
# Função para informações do usuário pelo username
def obter_info_usuario_por_username(username):
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT user_id, nome, username, role FROM users WHERE username = ?", (username,))
        resultado = cursor.fetchone()
        return dict(resultado) if resultado else None
    
# Função para verificar quantos produtos estão disponíveis
def verificar_produtos_menu():
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM produtos_padrao WHERE disponivel = 1")
        disponiveis = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM produtos_padrao")
        total = cursor.fetchone()[0]
        cursor.execute("SELECT SUM(quantidade_kg) FROM produtos_padrao WHERE disponivel = 1")
        kg_disponiveis = cursor.fetchone()[0] or 0
        porcentagem = (int(disponiveis) / int(total) * 100) if total > 0 else 0
        return {"disponiveis": disponiveis, "total": total, "porcentagem": porcentagem, "kg_disponiveis": kg_disponiveis}
    
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
        
# Função para atualizar um produto existente
def atualizar_produto(sabor, preco_pf, preco_cnpj, quantidade_kg, disponivel):
    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE produtos_padrao SET preco_pf = ?, preco_cnpj = ?, quantidade_kg = ?, disponivel = ? WHERE sabor = ?', 
                        (preco_pf, preco_cnpj, quantidade_kg, disponivel, sabor))
            if cursor.rowcount == 0:
                raise ValueError("Produto não encontrado para atualização.")
    except ValueError as e:
        print(f"Erro ao atualizar produto: {e}")
            
# Função deletar um produto
def deletar_produto(sabor):
    with sqlite3.connect(db_path) as conn: 
        conn.execute('DELETE FROM produtos_padrao WHERE sabor = ?', (sabor,))
        if conn.total_changes == 0:
            raise ValueError("Produto não encontrado para exclusão.")
        
# Função para verificar se um produto existe
def verificar_produto_existe(sabor):
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM produtos_padrao WHERE sabor = ?', (sabor,))
        return cursor.fetchone()[0] > 0

#Função registrar movimentações
def registrar_movimentacoes(sabor, quantidade_kg, validade, acao):
        try:
            quantidade_kg = float(str(quantidade_kg).replace(',', '.'))
            br_time = datetime.now(timezone(timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M:%S')
            with sqlite3.connect(db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT quantidade_kg FROM produtos_padrao WHERE sabor = ?', (sabor,))
                saldo_total = cursor.fetchone()[0] or 0

                if acao != 'Adicionar' and quantidade_kg > saldo_total:
                    raise ValueError(f'Saldo insuficiente. Saldo atual: {saldo_total} Kg')
                conn.execute("INSERT INTO movimentacoes (sabor, quantidade_kg, validade, acao, data) VALUES (?, ?, ?, ?, ?)", (sabor, quantidade_kg, validade, acao, br_time))
                if acao == 'Adicionar':
                    conn.execute("UPDATE produtos_padrao SET quantidade_kg = quantidade_kg + ? WHERE sabor = ?", (quantidade_kg, sabor))
                else:
                    conn.execute("UPDATE produtos_padrao SET quantidade_kg = quantidade_kg - ? WHERE sabor = ?", (quantidade_kg, sabor))

        except Exception as e:
            print(f"erro ao registrar log: {e}")
            raise

def obter_metricas_estoque():
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT SUM(quantidade_kg) FROM produtos_padrao")
        saldo_total = cursor.fetchone()[0] or 0

        cursor.execute("SELECT SUM(quantidade_kg) FROM movimentacoes WHERE acao = 'Adicionar' AND date(data) = date('now', '-3 hours')")
        entradas_hoje = cursor.fetchone()[0] or 0

        cursor.execute("SELECT SUM(quantidade_kg) FROM movimentacoes WHERE acao IN ('Venda', 'Vencido', 'Retirar') AND date(data) = date('now', '-3 hours')")
        saidas_hoje = cursor.fetchone()[0] or 0

        return {
            'saldo_total': saldo_total,
            'entradas_hoje': entradas_hoje,
            'saidas_hoje': saidas_hoje
        }

# Função para registrar uma ação no log
def registrar_log(nome_usuario, user_id, acao):
    try:
        br_time = datetime.now(timezone(timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M:%S')
        with sqlite3.connect(db_path) as conn:
            conn.execute('INSERT INTO logs (nome_usuario, user_id, acao, timestamp) VALUES (?, ?, ?, ?)', 
                        (nome_usuario, user_id, acao, br_time))
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

    
# Função para obter métricas dos funcionários
def obter_metricas_funcionarios():
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        total_funcionarios = cursor.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        total_cargos = cursor.execute("SELECT COUNT(DISTINCT role) FROM users").fetchone()[0]
        funcionarios_ativos = cursor.execute("SELECT COUNT(*) FROM users WHERE ultimo_acesso >= datetime('now', '-1 days')").fetchone()[0]
        return {"total_funcionarios": total_funcionarios, "total_cargos": total_cargos, "funcionarios_ativos": funcionarios_ativos}
    
# Função para obter a tabela completa de funcionários
def tabela_funcionarios():
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT nome, username, role, empresa, ultimo_acesso FROM users ORDER BY nome ASC")
        funcionarios = cursor.fetchall()
        return [dict(funcionario) for funcionario in funcionarios]
    
# Cadastro de funcionário (requer JWT)
def cadastro_funcionario(nome, username, password, role, empresa):
    try:
        with sqlite3.connect(db_path) as conn:
            pwd_hash = generate_password_hash(password)
            conn.execute('INSERT INTO users (nome, username, password, role, empresa) VALUES (?, ?, ?, ?, ?)', 
                        (nome, username, pwd_hash, role, empresa))
    except sqlite3.IntegrityError:
        raise ValueError("Username já existe. Escolha outro.")
    except ValueError as e:
        print(f"Erro ao cadastrar funcionário: {e}")

# Deletar funcionário (requer JWT)
def deletar_funcionario(username, password):
    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT password FROM users WHERE username = ?', (username,))
            user = cursor.fetchone()
            if user and check_password_hash(user[0], password):
                cursor.execute('DELETE FROM users WHERE username = ?', (username,))
                if cursor.rowcount == 0:
                    raise ValueError("Funcionário não encontrado para exclusão.")
            else:
                raise ValueError("Credenciais inválidas para exclusão.")
    except ValueError as e:
        print(f"Erro ao deletar funcionário: {e}")
    except Exception as e:
        print(f"Erro inesperado ao deletar funcionário: {e}")

# Função para atualizar a quantidade de um produto no estoque, considerando o lote específico (sabor + validade)
def atualizar_quantidade_produto(sabor, validade, nova_quantidade):
    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            # 1. Atualiza a tabela GERAL (produtos_padrao)
            # Usamos UPDATE com soma direta para evitar problemas de concorrência
            cursor.execute('UPDATE produtos_padrao SET quantidade_kg = quantidade_kg + ? WHERE sabor = ?', (nova_quantidade, sabor))
            if cursor.rowcount == 0:
                raise ValueError(f"Sabor '{sabor}' não cadastrado na tabela padrão.")
            # 2. Atualiza ou Insere na tabela de LOTES (produtos)
            # Verifica se já existe esse sabor com essa validade
            lote_existente = cursor.execute('SELECT quantidade_kg FROM produtos WHERE sabor = ? AND validade = ?', (sabor, validade)).fetchone()
            if lote_existente:
                # Se o lote já existe, soma à quantidade atual
                cursor.execute('UPDATE produtos SET quantidade_kg = quantidade_kg + ? WHERE sabor = ? AND validade = ?', (nova_quantidade, sabor, validade))
            else:
                # Se é um lote novo, cria a linha
                cursor.execute('INSERT INTO produtos (sabor, validade, quantidade_kg) VALUES (?, ?, ?)', (sabor, validade, nova_quantidade))
            conn.commit()
            print(f"Estoque de '{sabor}' (Validade: {validade}) atualizado com sucesso!")
    except ValueError as e:
        print(f"Erro de validação: {e}")
    except sqlite3.Error as e:
        print(f"Erro no Banco de Dados: {e}")
    except Exception as e:
        print(f"Erro inesperado: {e}")

# Função para subtrair a quantidade de um produto no estoque, considerando o lote específico (sabor + validade)
def subtrair_quantidade_produto(sabor, validade, quantidade_subtrair):    
    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            # 1. Busca a quantidade do lote específico
            res = cursor.execute('SELECT quantidade_kg FROM produtos WHERE sabor = ? AND validade = ?', (sabor, validade)).fetchone()
            if res is None:
                raise ValueError(f"Lote '{sabor}' com validade '{validade}' não encontrado.")
            qtd_lote_atual = res[0]
            if qtd_lote_atual < quantidade_subtrair:
                raise ValueError(f"Estoque insuficiente no lote (Disponível: {qtd_lote_atual}kg).")
            # 2. Calcula a nova quantidade do lote
            nova_qtd_lote = qtd_lote_atual - quantidade_subtrair
            # 3. Atualiza ou Deleta o lote na tabela 'produtos'
            if nova_qtd_lote > 0:
                cursor.execute('UPDATE produtos SET quantidade_kg = ? WHERE sabor = ? AND validade = ?', (nova_qtd_lote, sabor, validade))
            else:
                cursor.execute('DELETE FROM produtos WHERE sabor = ? AND validade = ?', (sabor, validade))
            # 4. Atualiza a tabela geral 'produtos_padrao' (mantém a linha mesmo que zerada)
            cursor.execute('UPDATE produtos_padrao SET quantidade_kg = quantidade_kg - ? WHERE sabor = ?', (quantidade_subtrair, sabor))
            conn.commit()
            print(f"Sucesso! Estoque de '{sabor}' atualizado.")
    except ValueError as e:
        print(f"Erro: {e}")
    except sqlite3.Error as e:
        print(f"Erro no Banco de Dados: {e}")

# Função que deleta um lote específico (sabor + validade) do estoque, por conta do vencimento
def vencimento_produto(sabor, validade):
    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            # Busca a quantidade do lote específico
            res = cursor.execute('SELECT quantidade_kg FROM produtos WHERE sabor = ? AND validade = ?', (sabor, validade)).fetchone()
            if res is None:
                raise ValueError(f"Lote '{sabor}' com validade '{validade}' não encontrado.")
            qtd_lote_atual = res[0]
            # Deleta o lote da tabela 'produtos'
            cursor.execute('DELETE FROM produtos WHERE sabor = ? AND validade = ?', (sabor, validade))
            # Atualiza a tabela geral 'produtos_padrao' subtraindo a quantidade do lote vencido
            cursor.execute('UPDATE produtos_padrao SET quantidade_kg = quantidade_kg - ? WHERE sabor = ?', (qtd_lote_atual, sabor))
            conn.commit()
            print(f"Lote '{sabor}' com validade '{validade}' removido por vencimento.")
    except ValueError as e:
        print(f"Erro: {e}")
    except sqlite3.Error as e:
        print(f"Erro no Banco de Dados: {e}")

# Função para atualizar a disponibilidade de um produto
def atualizar_disponibilidade_produto(sabor):
        try:
            with sqlite3.connect(db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT quantidade_kg FROM produtos_padrao WHERE sabor = ?', (sabor,))
                quantidade = cursor.fetchone()
                if quantidade and quantidade[0] > 0:
                    cursor.execute('UPDATE produtos_padrao SET disponivel = 1 WHERE sabor = ?', (sabor,))
                    print(f"Produto '{sabor}' agora está disponível.")
                elif quantidade:
                    cursor.execute('UPDATE produtos_padrao SET disponivel = 0 WHERE sabor = ?', (sabor,))
                    print(f"Produto '{sabor}' agora está indisponível.")
                conn.commit()
        except Exception as e:
            print(f"Erro ao verificar disponibilidade: {e}")

# Função para obter os nomes de todos os produtos
def obter_nome_produtos():
    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT sabor FROM produtos_padrao')
            produtos = cursor.fetchall()
            return [produto[0] for produto in produtos]
    except Exception as e:
        print(f"Erro ao obter nomes dos produtos: {e}")
        return []
    
#Função para obter o volume vendido no mês (Kg)
def obter_volume_vendido_mes():
    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT SUM(quantidade_kg) FROM movimentacoes WHERE acao = 'Venda' AND strftime('%Y-%m', data) = strftime('%Y-%m', 'now', '-3 hours')")
            kg_mes = cursor.fetchone() [0] or 0
            return kg_mes
    except Exception as e:
        print(f"erro ao obter o volume vendido do mês: {e}")


# --- Execução ---
if __name__ == "__main__":
    inicializar_banco()
