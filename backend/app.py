from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from core.database import (
registrar_usuario, login_usuario, obter_logs, obter_info_usuario_por_username, verificar_produtos_menu, obter_metricas_funcionarios,
tabela_produtos, cadastrar_produto, deletar_produto, registrar_log, deletar_logs_totais, atualizar_ultimo_acesso, tabela_funcionarios
)
import os
from dotenv import load_dotenv
from datetime import timedelta


app = Flask(__name__)
CORS(app)
load_dotenv()
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=8)
jwt = JWTManager(app)

# -------------------------
# Ping-Pong para teste de API
# -------------------------
@app.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({"status": "pong", "message": "API is running!"}), 200

# -------------------------
# Api's de Autenticação
# -------------------------
@app.route('/api/login', methods=['POST'])
def login():
    dados = request.get_json()
    username = dados.get('username')
    password = dados.get('password')

    if not username or not password:
        return jsonify({"msg": "Usuário e senha são obrigatórios"}), 400

    verify = login_usuario(username, password)

    try:
        if verify:
            access_token = create_access_token(identity=username)
            usuario = obter_info_usuario_por_username(username)
            atualizar_ultimo_acesso(username)
            return jsonify({
                "msg": "sucess",
                "token": access_token,
                "user": usuario
            }), 200
        return jsonify({"msg": "Credenciais inválidas"}), 401
    except Exception as e:
        return jsonify({"msg": "Erro ao processar login", "error": str(e)}), 500

@app.route('/api/register', methods=['POST'])
def register():
    dados = request.get_json()
    nome = dados.get('nome')
    username = dados.get('username')
    password = dados.get('password')
    role = dados.get('role')
    empresa = dados.get('empresa')

    try:
        registrar_usuario(nome, username, password, role, empresa)
        return jsonify({"msg": "Usuário registrado com sucesso!"}), 201
    except Exception as e:
        return jsonify({"msg": "Erro ao registrar usuário", "error": str(e)}), 500
    
@app.route('/api/me', methods=['GET'])
@jwt_required()
def me():
    username = get_jwt_identity()
    usuario = obter_info_usuario_por_username(username)

    if not usuario:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    return jsonify({"user": usuario}), 200

# -------------------------
# Api's de Logs 
# -------------------------
@app.route('/api/logs', methods=['GET'])
@jwt_required()
def logs():
    try:
        dados = obter_logs()
        return jsonify({"status": "sucesso", "dados": dados}), 200
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500

@app.route('/api/logs', methods=['DELETE'])
@jwt_required()
def deletar_logs():
    try:
        # Informações do usuário
        username = get_jwt_identity()
        info_user = obter_info_usuario_por_username(username)
        nome_usuario = info_user['nome']
        id_usuario = info_user['user_id']
        role_usuario = info_user['role']
        # Verificar se o usuário é desenvolvedor
        if role_usuario == 'desenvolvedor':
            deletar_logs_totais()
            return jsonify({"status": "sucesso", "mensagem": "Logs deletados com sucesso!"}), 200
        else:
            return jsonify({"status": "erro", "mensagem": "Acesso negado. Apenas desenvolvedores podem deletar os logs."}), 403
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": "Algo deu errado! Tente Novamente Mais Tarde! "}), 500
    
# -------------------------
# Api's do Menu Principal
# -------------------------
@app.route("/api/menu/metrics", methods=['GET'])
@jwt_required()
def menu_metrics():
    try:
        dados = verificar_produtos_menu()
        dados_variacoes = {key: dados[key] for key in ['disponiveis', 'total', 'porcentagem']}
        total_kg = dados.get('kg_disponiveis', 0)
        return jsonify({"status": "sucesso", "quantidade": dados_variacoes, "kg_disponiveis": total_kg}), 200
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500

# -------------------------
# Api's Gerenciar Produtos
# -------------------------
@app.route('/api/produtos/metricas', methods=['GET'])
@jwt_required()
def produtos_metricas():         
    try:
        dados = verificar_produtos_menu()
        return jsonify({"disponiveis": dados["disponiveis"], "total": dados["total"], "porcentagem": dados['porcentagem']}), 200
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500
    
@app.route('/api/produtos/tabela', methods=['GET'])
@jwt_required()
def tabela_produtos_completa():
    try:
        dados = tabela_produtos()
        return jsonify({"status": "sucesso", "dados": dados}), 200
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500
    
@app.route('/api/produtos/cadastrar', methods=['POST'])
@jwt_required()
def cadastrar_novo_produto():
    try:
        # Informações do usuário
        username = get_jwt_identity()
        info_user = obter_info_usuario_por_username(username)
        nome_usuario = info_user['nome']
        id_usuario = info_user['user_id']
        # Dados do produto
        dados = request.get_json()
        sabor = dados.get('sabor')
        preco_pf = dados.get('preco_pf')
        preco_cnpj = dados.get('preco_cnpj')
        quantidade_kg = dados.get('quantidade_kg')
        disponivel = dados.get('disponivel')

        if not all([sabor, preco_pf, preco_cnpj, quantidade_kg, disponivel is not None]):
            return jsonify({"status": "erro", "mensagem": "Todos os campos são obrigatórios"}), 400
        cadastrar_produto(sabor, preco_pf, preco_cnpj, quantidade_kg, disponivel)
        registrar_log(nome_usuario, id_usuario, f"Cadastrou o produto {sabor}")
        return jsonify({"status": "sucesso", "mensagem": "Produto cadastrado com sucesso!"}), 201
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500
    
@app.route('/api/produtos/deletar', methods=['DELETE'])
@jwt_required()
def deletar_produtodb():
    try:
        # Informações do usuário
        username = get_jwt_identity()
        info_user = obter_info_usuario_por_username(username)
        nome_usuario = info_user['nome']
        id_usuario = info_user['user_id']
        # Dados do produto
        dados = request.get_json()
        sabor = dados.get('sabor')
        print(sabor)
        if not sabor:
            return jsonify({"status": "erro", "mensagem": "Campo 'sabor' é obrigatório"}), 400
        deletar_produto(sabor)
        registrar_log(nome_usuario, id_usuario, f"Deletou o produto {sabor}")
        return jsonify({"status": "sucesso", "mensagem": "Produto deletado com sucesso!"}), 200
    except ValueError as ve:
        return jsonify({"status": "erro", "mensagem": str(ve)}), 404
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500
    
# -------------------------
# APIs Funcionários
# -------------------------
@app.route('/api/funcionarios/metricas', methods=['GET'])
@jwt_required()
def funcionarios_metricas():
    try:
        dados = obter_metricas_funcionarios()
        total_funcionarios = dados.get('total_funcionarios', 0)
        total_cargos = dados.get('total_cargos', 0)
        funcionarios_ativos = dados.get('funcionarios_ativos', 0)
        return jsonify({
            "total_funcionarios": total_funcionarios,
            "total_cargos": total_cargos,
            "funcionarios_ativos": funcionarios_ativos
        }), 200
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500

@app.route('/api/funcionarios/tabela', methods=['GET'])
@jwt_required()
def tabela_funcionarios_completa():
    try:
        lista_funcionarios = tabela_funcionarios()
        dados = [
            {
                "nome": f["nome"],
                "role": f["role"].capitalize() if f.get("role") else "Funcionário",
                "empresa": f["empresa"],
                "ultimo_acesso": f["ultimo_acesso"]
            }
            for f in lista_funcionarios
        ]
        return jsonify({"status": "sucesso", "dados": dados}), 200
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)