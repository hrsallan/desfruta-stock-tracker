import psycopg2
import psycopg2.extras
import os
from dotenv import load_dotenv, find_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone, timedelta

load_dotenv(find_dotenv())  # Carrega as variáveis de ambiente do arquivo .env

senhadaporra = os.getenv("SENHA_MASTER")
pass_jwt = generate_password_hash(senhadaporra) if senhadaporra else None
DATABASE_URL = os.getenv('DATABASE_URL')

def get_conn():
    return psycopg2.connect(DATABASE_URL)

def inicializar_banco():
    with get_conn() as conn:
        cursor = conn.cursor()

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS produtos_padrao (
            id SERIAL PRIMARY KEY,
            sabor TEXT NOT NULL,
            preco_pf REAL,
            preco_cnpj REAL,
            quantidade_kg REAL DEFAULT 0,
            disponivel INTEGER DEFAULT 0
        )
        """)

        try:
            cursor.execute("""
                ALTER TABLE produtos_padrao 
                ADD CONSTRAINT produtos_padrao_sabor_unique UNIQUE (sabor)
            """)
            conn.commit()
        except Exception:
            conn.rollback()

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS produtos ( 
            id SERIAL PRIMARY KEY,
            sabor TEXT,
            quantidade_kg REAL,
            validade DATE
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id SERIAL PRIMARY KEY,
            nome TEXT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT,
            empresa TEXT,
            data_criacao TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo'),
            ultimo_acesso TIMESTAMP
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS logs (
            id SERIAL PRIMARY KEY,
            nome_usuario TEXT,
            user_id INTEGER,
            acao TEXT,
            timestamp TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo')
        )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS movimentacoes (
                id SERIAL PRIMARY KEY,
                sabor TEXT,
                quantidade_kg REAL,
                validade TEXT,
                acao TEXT,
                tipo TEXT,
                data TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo')
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
            "INSERT INTO produtos_padrao (sabor, preco_pf, preco_cnpj, quantidade_kg, disponivel) VALUES (%s, %s, %s, %s, %s) ON CONFLICT DO NOTHING",
            produtos_padrao
        )

        usuarios_padrao = [
            ("gabriel.dev", pass_jwt, "Gabriel Ogura", "desenvolvedor", "Desfruta Polpas"),
            ("eder.ceo", pass_jwt, "Éder Ogura", "CEO", "Desfruta Polpas"),
            ("ana.ceo", pass_jwt, "Ana Ogura", "CEO", "Desfruta Polpas"),
            ("thyago.ceo", pass_jwt, "Thyago Ogura", "CEO", "Desfruta Polpas")
        ]

        cursor.executemany(
            "INSERT INTO users (username, password, nome, role, empresa) VALUES (%s, %s, %s, %s, %s) ON CONFLICT DO NOTHING",
            usuarios_padrao
        )
        conn.commit()
        print("Banco inicializado com sucesso!")

# --- Funções ---

# Função para registrar um novo usuário
def registrar_usuario(nome, username, password, role, empresa):
    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            pwd_hash = generate_password_hash(password)
            cursor.execute('INSERT INTO users (nome, username, password, role, empresa) VALUES (%s, %s, %s, %s, %s)', 
                        (nome, username, pwd_hash, role, empresa))
    except psycopg2.errors.UniqueViolation:
        raise ValueError("Username já existe. Escolha outro.")

# Função para autenticar usuário
def login_usuario(username, password):
    with get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT password FROM users WHERE username = %s', (username,))
        user = cursor.fetchone()
        return user and check_password_hash(user[0], password)
    
# Função Atualizar o último acesso do usuário
def atualizar_ultimo_acesso(username):
    try:
        conn = get_conn()
        cursor = conn.cursor()
        br_time = datetime.now(timezone(timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute("UPDATE users SET ultimo_acesso = %s WHERE username = %s", (br_time, username))
        conn.commit()
    except psycopg2.Error as e:
        print(f"Erro ao atualizar último acesso: {e}")
    finally:
        if conn:
            conn.close()
    
# Função para informações do usuário pelo username
def obter_info_usuario_por_username(username):
    with get_conn() as conn:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT user_id, nome, username, role FROM users WHERE username = %s", (username,))
        resultado = cursor.fetchone()
        return dict(resultado) if resultado else None
    
# Função para verificar quantos produtos estão disponíveis
def verificar_produtos_menu():
    with get_conn() as conn:
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
    with get_conn() as conn:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute("""
            SELECT
                sabor,
                preco_pf,
                preco_cnpj,
                quantidade_kg,
                disponivel
            FROM produtos_padrao
            ORDER BY unaccent(LOWER(sabor)) ASC
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
    with get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute('INSERT INTO produtos_padrao (sabor, preco_pf, preco_cnpj, quantidade_kg, disponivel) VALUES (%s, %s, %s, %s, %s)', 
                     (sabor, preco_pf, preco_cnpj, quantidade_kg, disponivel))
        
# Função para atualizar um produto existente
def atualizar_produto(sabor, preco_pf, preco_cnpj, quantidade_kg, disponivel):
    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE produtos_padrao SET preco_pf = %s, preco_cnpj = %s, quantidade_kg = %s, disponivel = %s WHERE sabor = %s', 
                        (preco_pf, preco_cnpj, quantidade_kg, disponivel, sabor))
            if cursor.rowcount == 0:
                raise ValueError("Produto não encontrado para atualização.")
    except ValueError as e:
        print(f"Erro ao atualizar produto: {e}")
            
# Função deletar um produto
def deletar_produto(sabor):
    with get_conn() as conn: 
        cursor = conn.cursor()
        cursor.execute('DELETE FROM produtos_padrao WHERE sabor = %s', (sabor,))
        if cursor.rowcount == 0:
            raise ValueError("Produto não encontrado para exclusão.")
        
# Função para verificar se um produto existe
def verificar_produto_existe(sabor):
    with get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM produtos_padrao WHERE sabor = %s', (sabor,))
        return cursor.fetchone()[0] > 0

#Função registrar movimentações
def registrar_movimentacoes(sabor, quantidade_kg, validade, acao, tipo):
        try:
            quantidade_kg = float(str(quantidade_kg).replace(',', '.'))
            br_time = datetime.now(timezone(timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M:%S')
            with get_conn() as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT quantidade_kg FROM produtos_padrao WHERE sabor = %s', (sabor,))
                saldo_total = cursor.fetchone()[0] or 0

                if acao != 'Adicionar' and quantidade_kg > saldo_total:
                    raise ValueError(f'Saldo insuficiente. Saldo atual: {saldo_total} Kg')
                cursor.execute("INSERT INTO movimentacoes (sabor, quantidade_kg, validade, acao, data, tipo) VALUES (%s, %s, %s, %s, %s, %s)", (sabor, quantidade_kg, validade, acao, br_time, tipo))
                if acao == 'Adicionar':
                    cursor.execute("UPDATE produtos_padrao SET quantidade_kg = quantidade_kg + %s WHERE sabor = %s", (quantidade_kg, sabor))
                else:
                    cursor.execute("UPDATE produtos_padrao SET quantidade_kg = quantidade_kg - %s WHERE sabor = %s", (quantidade_kg, sabor))
                
                cursor.execute("""
                    UPDATE produtos_padrao
                    SET disponivel = CASE WHEN quantidade_kg > 0 THEN 1 ELSE 0 END
                    WHERE sabor = %s
                """, (sabor,))

        except Exception as e:
            print(f"erro ao registrar log: {e}")
            raise

def obter_metricas_estoque():
    with get_conn() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT SUM(quantidade_kg) FROM produtos_padrao")
        saldo_total = cursor.fetchone()[0] or 0

        cursor.execute("SELECT SUM(quantidade_kg) FROM movimentacoes WHERE acao = 'Adicionar' AND date(data) = DATE(NOW() AT TIME ZONE 'America/Sao_Paulo')")
        entradas_hoje = cursor.fetchone()[0] or 0

        cursor.execute("SELECT SUM(quantidade_kg) FROM movimentacoes WHERE acao IN ('Venda', 'Vencido', 'Retirar') AND date(data) = DATE(NOW() AT TIME ZONE 'America/Sao_Paulo')")
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
        with get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute('INSERT INTO logs (nome_usuario, user_id, acao, timestamp) VALUES (%s, %s, %s, %s)', 
                        (nome_usuario, user_id, acao, br_time))
    except Exception as e:
        print(f"Erro ao registrar log: {e}")

# Função para obter os logs
def obter_logs():
    with get_conn() as conn:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT nome_usuario, acao, timestamp FROM logs ORDER BY timestamp DESC")
        logs = cursor.fetchall()
        return [dict(log) for log in logs]
    
# Função para deletar os logs
def deletar_logs_totais():
    try:
        conn = get_conn()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM logs")
        conn.commit() 
        print(f"Logs deletados com sucesso. Linhas afetadas: {cursor.rowcount}")
    except psycopg2.Error as e:
        print(f"Erro no banco de dados: {e}")
    finally:
        if conn:
            conn.close()

    
# Função para obter métricas dos funcionários
def obter_metricas_funcionarios():
    with get_conn() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM users")
        total_funcionarios = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(DISTINCT role) FROM users")
        total_cargos = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM users WHERE ultimo_acesso >= NOW() - INTERVAL '1 day'")
        funcionarios_ativos = cursor.fetchone()[0]
        return {"total_funcionarios": total_funcionarios, "total_cargos": total_cargos, "funcionarios_ativos": funcionarios_ativos}
    
# Função para obter a tabela completa de funcionários
def tabela_funcionarios():
    with get_conn() as conn:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT nome, username, role, empresa, ultimo_acesso FROM users ORDER BY nome ASC")
        funcionarios = cursor.fetchall()
        return [dict(funcionario) for funcionario in funcionarios]
    
# Cadastro de funcionário (requer JWT)
def cadastro_funcionario(nome, username, password, role, empresa):
    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            pwd_hash = generate_password_hash(password)
            cursor.execute('INSERT INTO users (nome, username, password, role, empresa) VALUES (%s, %s, %s, %s, %s)', 
                        (nome, username, pwd_hash, role, empresa))
    except psycopg2.errors.UniqueViolation:
        raise ValueError("Username já existe. Escolha outro.")
    except ValueError as e:
        print(f"Erro ao cadastrar funcionário: {e}")

# Deletar funcionário (requer JWT)
def deletar_funcionario(username, password):
    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT password FROM users WHERE username = %s', (username,))
            user = cursor.fetchone()
            if user and check_password_hash(user[0], password):
                cursor.execute('DELETE FROM users WHERE username = %s', (username,))
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
        with get_conn() as conn:
            cursor = conn.cursor()
            # 1. Atualiza a tabela GERAL (produtos_padrao)
            # Usamos UPDATE com soma direta para evitar problemas de concorrência
            cursor.execute('UPDATE produtos_padrao SET quantidade_kg = quantidade_kg + %s WHERE sabor = %s', (nova_quantidade, sabor))
            if cursor.rowcount == 0:
                raise ValueError(f"Sabor '{sabor}' não cadastrado na tabela padrão.")
            # 2. Atualiza ou Insere na tabela de LOTES (produtos)
            # Verifica se já existe esse sabor com essa validade
            cursor.execute('SELECT quantidade_kg FROM produtos WHERE sabor = %s AND validade = %s', (sabor, validade))
            lote_existente = cursor.fetchone()
            if lote_existente:
                # Se o lote já existe, soma à quantidade atual
                cursor.execute('UPDATE produtos SET quantidade_kg = quantidade_kg + %s WHERE sabor = %s AND validade = %s', (nova_quantidade, sabor, validade))
            else:
                # Se é um lote novo, cria a linha
                cursor.execute('INSERT INTO produtos (sabor, validade, quantidade_kg) VALUES (%s, %s, %s)', (sabor, validade, nova_quantidade))
            conn.commit()
            print(f"Estoque de '{sabor}' (Validade: {validade}) atualizado com sucesso!")
    except ValueError as e:
        print(f"Erro de validação: {e}")
    except psycopg2.Error as e:
        print(f"Erro no Banco de Dados: {e}")
    except Exception as e:
        print(f"Erro inesperado: {e}")

# Função para subtrair a quantidade de um produto no estoque, considerando o lote específico (sabor + validade)
def subtrair_quantidade_produto(sabor, validade, quantidade_subtrair):    
    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            # 1. Busca a quantidade do lote específico
            cursor.execute('SELECT quantidade_kg FROM produtos WHERE sabor = %s AND validade = %s', (sabor, validade))
            res = cursor.fetchone()
            if res is None:
                raise ValueError(f"Lote '{sabor}' com validade '{validade}' não encontrado.")
            qtd_lote_atual = res[0]
            if qtd_lote_atual < quantidade_subtrair:
                raise ValueError(f"Estoque insuficiente no lote (Disponível: {qtd_lote_atual}kg).")
            # 2. Calcula a nova quantidade do lote
            nova_qtd_lote = qtd_lote_atual - quantidade_subtrair
            # 3. Atualiza ou Deleta o lote na tabela 'produtos'
            if nova_qtd_lote > 0:
                cursor.execute('UPDATE produtos SET quantidade_kg = %s WHERE sabor = %s AND validade = %s', (nova_qtd_lote, sabor, validade))
            else:
                cursor.execute('DELETE FROM produtos WHERE sabor = %s AND validade = %s', (sabor, validade))
            # 4. Atualiza a tabela geral 'produtos_padrao' (mantém a linha mesmo que zerada)
            cursor.execute('UPDATE produtos_padrao SET quantidade_kg = quantidade_kg - %s WHERE sabor = %s', (quantidade_subtrair, sabor))
            conn.commit()
            print(f"Sucesso! Estoque de '{sabor}' atualizado.")
    except ValueError as e:
        print(f"Erro: {e}")
    except psycopg2.Error as e:
        print(f"Erro no Banco de Dados: {e}")

# Função que deleta um lote específico (sabor + validade) do estoque, por conta do vencimento
def vencimento_produto(sabor, validade):
    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            # Busca a quantidade do lote específico
            cursor.execute('SELECT quantidade_kg FROM produtos WHERE sabor = %s AND validade = %s', (sabor, validade))
            res = cursor.fetchone()
            if res is None:
                raise ValueError(f"Lote '{sabor}' com validade '{validade}' não encontrado.")
            qtd_lote_atual = res[0]
            # Deleta o lote da tabela 'produtos'
            cursor.execute('DELETE FROM produtos WHERE sabor = %s AND validade = %s', (sabor, validade))
            # Atualiza a tabela geral 'produtos_padrao' subtraindo a quantidade do lote vencido
            cursor.execute('UPDATE produtos_padrao SET quantidade_kg = quantidade_kg - %s WHERE sabor = %s', (qtd_lote_atual, sabor))
            conn.commit()
            print(f"Lote '{sabor}' com validade '{validade}' removido por vencimento.")
    except ValueError as e:
        print(f"Erro: {e}")
    except psycopg2.Error as e:
        print(f"Erro no Banco de Dados: {e}")

# Função para atualizar a disponibilidade de um produto
def atualizar_disponibilidade_produto(sabor):
        try:
            with get_conn() as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT quantidade_kg FROM produtos_padrao WHERE sabor = %s', (sabor,))
                quantidade = cursor.fetchone()
                if quantidade and quantidade[0] > 0:
                    cursor.execute('UPDATE produtos_padrao SET disponivel = 1 WHERE sabor = %s', (sabor,))
                    print(f"Produto '{sabor}' agora está disponível.")
                elif quantidade:
                    cursor.execute('UPDATE produtos_padrao SET disponivel = 0 WHERE sabor = %s', (sabor,))
                    print(f"Produto '{sabor}' agora está indisponível.")
                conn.commit()
        except Exception as e:
            print(f"Erro ao verificar disponibilidade: {e}")

# Função para obter os nomes de todos os produtos
def obter_nome_produtos():
    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT sabor FROM produtos_padrao ORDER BY sabor ASC')
            produtos = cursor.fetchall()
            return [produto[0] for produto in produtos]
    except Exception as e:
        print(f"Erro ao obter nomes dos produtos: {e}")
        return []
    
#Função para obter o volume vendido no mês (Kg)
def obter_volume_vendido_mes():
    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT SUM(quantidade_kg)
                FROM movimentacoes
                WHERE acao = 'Venda'
                AND TO_CHAR(data AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM') = TO_CHAR(NOW() AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM')
            """)
            kg_mes = cursor.fetchone() [0] or 0
            return kg_mes
    except Exception as e:
        print(f"erro ao obter o volume vendido do mês: {e}")

def obter_volume_vendido_mes_anterior():
    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT SUM(quantidade_kg)
                FROM movimentacoes
                WHERE acao = 'Venda'
                AND TO_CHAR(data AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM') = TO_CHAR((NOW() - INTERVAL '1 month') AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM')
            """)
            kg_mes_anterior = cursor.fetchone() [0] or 0
            return kg_mes_anterior
    except Exception as e:
        print(f"erro ao obter o volume vendido do mês anterior: {e}")

def obter_faturamento_mes():
    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT SUM (
                    m.quantidade_kg * CASE
                        WHEN m.tipo = 'Pessoa Física (PF)' THEN p.preco_pf
                        ELSE p.preco_cnpj
                    END
                )
                FROM movimentacoes m
                JOIN produtos_padrao p ON m.sabor = p.sabor
                WHERE m.acao = 'Venda'
                AND TO_CHAR(m.data AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM') = TO_CHAR(NOW() AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM')
            """)
            faturamento_mes = cursor.fetchone() [0] or 0
            return faturamento_mes
    except Exception as e:
        print(f"erro ao obter o faturamento do mês: {e}")

def obter_faturamento_mes_anterior():
    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT SUM(
                    m.quantidade_kg * CASE
                        WHEN m.tipo = 'Pessoa Física (PF)' THEN p.preco_pf
                        ELSE p.preco_cnpj
                    END
                )
                FROM movimentacoes m
                JOIN produtos_padrao p ON m.sabor = p.sabor
                WHERE m.acao = 'Venda'
                AND TO_CHAR(data AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM') = TO_CHAR((NOW() - INTERVAL '1 month') AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM')
            """)
            faturamento_mes_anterior = cursor.fetchone() [0] or 0
            return faturamento_mes_anterior
    except Exception as e:
        print(f"erro ao obter faturamento do mês anterior: {e}")

def obter_ticket_medio_mes():
    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT
                    SUM(m.quantidade_kg * CASE WHEN m.tipo = 'Pessoa Física (PF)' THEN p.preco_pf ELSE p.preco_cnpj END),
                    COUNT(*)
                FROM movimentacoes m
                JOIN produtos_padrao p ON m.sabor = p.sabor
                WHERE m.acao = 'Venda'
                AND TO_CHAR(m.data AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM') = TO_CHAR(NOW() AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM')
            """)
            resultado = cursor.fetchone()
            faturamento = resultado [0] or 0
            contagem = resultado [1] or 0
            ticket_medio = faturamento / contagem
            return ticket_medio
    except Exception as e:
        print(f"erro ao obter o ticket médio: {e}")

def obter_ticket_medio_mes_anterior():
    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT
                    SUM(m.quantidade_kg * CASE WHEN m.tipo = 'Pessoa Física (PF)' THEN p.preco_pf ELSE p.preco_cnpj END),
                    COUNT(*)
                    FROM movimentacoes m
                    JOIN produtos_padrao p ON m.sabor = p.sabor
                    WHERE m.acao = 'Venda'
                    AND TO_CHAR(data AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM') = TO_CHAR((NOW() - INTERVAL '1 month') AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM')
            """)
            resultado = cursor.fetchone()
            faturamento_anterior = resultado [0] or 0
            contagem_anterior = resultado [1] or 0
            ticket_medio_anterior = faturamento_anterior / contagem_anterior
            return ticket_medio_anterior
    except Exception as e:
        print(f"erro ao obter ticket médio anterior: {e}")

def obter_faturamento_por_tipo_mes():
    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT
                    SUM(CASE WHEN m.tipo = 'Pessoa Física (PF)' THEN m.quantidade_kg * p.preco_pf ELSE 0 END),
                    SUM(CASE WHEN m.tipo = 'Pessoa Jurídica (CNPJ)' THEN m.quantidade_kg * p.preco_cnpj ELSE 0 END)
                FROM movimentacoes m
                JOIN produtos_padrao p ON m.sabor = p.sabor
                WHERE m.acao = 'Venda'
                AND TO_CHAR(m.data AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM') = TO_CHAR(NOW() AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM')
            """)
            resultado = cursor.fetchone()
            faturamento_pf = resultado [0] or 0
            faturamento_cnpj = resultado [1] or 1
            return faturamento_pf, faturamento_cnpj
    except Exception as e:
        print(f"erro ao obter faturamento por tipo: {e}")

def obter_faturamento_anual():
    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT
                    TO_CHAR(m.data AT TIME ZONE 'America/Sao_Paulo', 'MM') as mes,
                    SUM(m.quantidade_kg * CASE
                        WHEN m.tipo = 'Pessoa Física (PF)' THEN p.preco_pf
                        ELSE p.preco_cnpj
                    END)
                FROM movimentacoes m
                JOIN produtos_padrao p ON m.sabor = p.sabor
                WHERE m.acao = 'Venda'
                AND TO_CHAR(data AT TIME ZONE 'America/Sao_Paulo', 'YYYY') = TO_CHAR(NOW() AT TIME ZONE 'America/Sao_Paulo', 'YYYY')
                GROUP BY mes
                ORDER BY mes ASC
            """)
            resultado = cursor.fetchall()
            return resultado
    except Exception as e:
        print(f'erro ao obter faturamento anual: {e}')

def obter_top5_produtos_mes():
    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT sabor, SUM(quantidade_kg) as total
                FROM movimentacoes
                WHERE acao = 'Venda'
                AND TO_CHAR(data AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM') = TO_CHAR(NOW() AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM')
                GROUP BY sabor
                ORDER BY total DESC
                LIMIT 5
            """)
            resultado = cursor.fetchall()
            return resultado
    except Exception as e:
        print(f'erro ao obter top 5 produtos do mês: {e}')

# --- Execução ---
if __name__ == "__main__":
    inicializar_banco()
