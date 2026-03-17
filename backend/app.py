from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import os
from dotenv import load_dotenv
from datetime import timedelta
from core.database import (
registrar_usuario, login_usuario, obter_logs, obter_info_usuario_por_username, verificar_produtos_menu, obter_metricas_funcionarios,
tabela_produtos, cadastrar_produto, deletar_produto, registrar_log, deletar_logs_totais, atualizar_ultimo_acesso, tabela_funcionarios,
cadastro_funcionario, deletar_funcionario, atualizar_produto, verificar_produto_existe, obter_nome_produtos, registrar_movimentacoes, obter_metricas_estoque, obter_volume_vendido_mes
)

# -------------------------
# Configurações do Flask e JWT
# -------------------------
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
    # Endpoint simples para testar se a API está funcionando, retorna um status de sucesso e uma mensagem
    return jsonify({"status": "pong", "message": "API is running!"}), 200

# -------------------------
# Api's de Autenticação
# -------------------------
@app.route('/api/login', methods=['POST'])
def login():
    try:
        # Obter os dados de login a partir do corpo da requisição, verificar as credenciais e retornar um token JWT se forem válidas
        dados = request.get_json()
        username = dados.get('username')
        password = dados.get('password')
        # Validação dos campos de login, se não forem fornecidos, retorna erro
        if not username or not password:
            return jsonify({"msg": "Usuário e senha são obrigatórios"}), 400

        verify = login_usuario(username, password)

        try:
            # Se as credenciais forem válidas, criar um token JWT e retornar as informações do usuário
            if verify:
                access_token = create_access_token(identity=username)
                usuario = obter_info_usuario_por_username(username)
                atualizar_ultimo_acesso(username)
                # Remover o campo de senha da resposta para segurança
                return jsonify({
                    "msg": "sucess",
                    "token": access_token,
                    "user": usuario
                }), 200
            # Se as credenciais forem inválidas, retornar erro de autenticação
            return jsonify({"msg": "Credenciais inválidas"}), 401
        # Tratamento de erros específicos
        except ValueError as ve:
            return jsonify({"msg": str(ve)}), 400
        except Exception as e:
            return jsonify({"msg": "Erro ao processar login", "error": str(e)}), 500
    # Tratamento de erros específicos para a requisição
    except ValueError as ve:
        return jsonify({"msg": str(ve)}), 400
    except Exception as e:
        return jsonify({"msg": "Erro ao processar requisição", "error": str(e)}), 500

@app.route('/api/register', methods=['POST'])
def register():
    # Obter os dados do usuário a partir do corpo da requisição e registrar no banco de dados
    try:
        dados = request.get_json()
        nome = dados.get('nome')
        username = dados.get('username')
        password = dados.get('password')
        role = dados.get('role')
        empresa = dados.get('empresa')
        senha_register = dados.get('master_password')
        # Verificar se a senha de registro foi fornecida
        if not senha_register:
            return jsonify({"msg": "Senha de registro é obrigatória"}), 400
        # Verificar se a senha de registro é correta
        if senha_register != os.getenv("MASTER_PASSWORD"):
            return jsonify({"msg": "Senha de registro incorreta"}), 403
        # Validar campos obrigatórios        
        if not all([nome, username, password, role, empresa]):
            return jsonify({"msg": "Todos os campos são obrigatórios"}), 400
        # Registrar usuário no banco de dados  
        registrar_usuario(nome, username, password, role, empresa)
        return jsonify({"msg": "Usuário registrado com sucesso!"}), 201
    # Tratamento de erros específicos
    except ValueError as ve:
        return jsonify({"msg": str(ve)}), 400
    except Exception as e:
        return jsonify({"msg": "Erro ao registrar usuário", "error": str(e)}), 500
    
@app.route('/api/me', methods=['GET'])
@jwt_required()
def me():
    # Obter o nome de usuário do token JWT e buscar as informações do usuário no banco de dados
    username = get_jwt_identity()
    dados = obter_info_usuario_por_username(username)
    usuario = dados["username"] if dados else None
    nome = dados["nome"] if dados else None
    role = dados["role"] if dados else None

    if not usuario:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    return jsonify(
        {
            "user": usuario,
            "nome": nome,
            "role": role
         }), 200

@app.route('/api/health', methods=['GET'])
def health():
    try:
        # Verificar a saúde da API, retornando um status de sucesso se tudo estiver funcionando corretamente
        return jsonify({"status": "sucesso", "message": "API is healthy!"}), 200
    except Exception as e:
        return jsonify({"status": "erro", "message": "API is unhealthy!", "error": str(e)}), 500

# -------------------------
# Api's de Logs 
# -------------------------
@app.route('/api/logs', methods=['GET'])
@jwt_required()
def logs():
    # Obter os logs do banco de dados e retornar em formato JSON
    try:
        # Separa os dados necessários para a resposta
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
    # Tratamento de erros específicos
    except ValueError as ve:
        return jsonify({"status": "erro", "mensagem": str(ve)}), 400
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": "Algo deu errado! Tente Novamente Mais Tarde! "}), 500
    
# -------------------------
# Api's Menu Principal
# -------------------------
@app.route('/api/menu/metrics', methods=['GET'])
@jwt_required()
def menu_metrics():
    # Obter as métricas dos produtos do banco de dados e retornar em formato JSON
    try:
        # Separa os dados necessários para a resposta
        dados = verificar_produtos_menu()
        dados_variacoes = {key: dados[key] for key in ['disponiveis', 'total', 'porcentagem']}
        total_kg = dados.get('kg_disponiveis', 0)
        return jsonify({"status": "sucesso", "quantidade": dados_variacoes, "kg_disponiveis": total_kg}), 200
    # Tratamento de erros específicos
    except ValueError as ve:
        return jsonify({"status": "erro", "mensagem": str(ve)}),
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500

# -------------------------
# Api's Gerenciar Produtos
# -------------------------
@app.route('/api/produtos/metricas', methods=['GET'])
@jwt_required()
def produtos_metricas():     
    # Obter as métricas dos produtos do banco de dados e retornar em formato JSON    
    try:
        # Separa os dados necessários para a resposta
        dados = verificar_produtos_menu()
        return jsonify({"disponiveis": dados["disponiveis"], "total": dados["total"], "porcentagem": dados['porcentagem']}), 200
   # Tratamento de erros específicos
    except ValueError as ve:
        return jsonify({"status": "erro", "mensagem": str(ve)}), 400
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500
    
@app.route('/api/produtos/tabela', methods=['GET'])
@jwt_required()
def tabela_produtos_completa():
    # Obter a tabela completa de produtos do banco de dados
    try:
        # Separa os dados necessários para a resposta
        dados = tabela_produtos()
        return jsonify({"status": "sucesso", "dados": dados}), 200
    # Tratamento de erros específicos
    except ValueError as ve:
        return jsonify({"status": "erro", "mensagem": str(ve)}), 400
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
        # Validação do campo disponivel, deve ser "Ativo" ou "Inativo", caso contrário, retorna erro
        if disponivel.lowe() == "ativo":
            disponivel = 1
        elif disponivel.lower() == "inativo":
            disponivel = 0
        else:
            return jsonify({"status": "erro", "mensagem": "Campo 'disponivel' deve ser 'Ativo' ou 'Inativo'"}), 400
        # Validação dos campos obrigatórios, se algum campo não for fornecido, retorna erro
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
        # Validação do campo sabor, se não for fornecido, retorna erro
        if not sabor:
            return jsonify({"status": "erro", "mensagem": "Campo 'sabor' é obrigatório"}), 400
        deletar_produto(sabor)
        registrar_log(nome_usuario, id_usuario, f"Deletou o produto {sabor}")
        return jsonify({"status": "sucesso", "mensagem": "Produto deletado com sucesso!"}), 200
    except ValueError as ve:
        return jsonify({"status": "erro", "mensagem": str(ve)}), 404
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500
    
@app.route('/api/produtos/atualizar', methods=['PUT'])
@jwt_required()
def atualizar_produto_db():
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
        # Validação do campo sabor, se não for fornecido, retorna erro
        verify = verificar_produto_existe(sabor)
        if not verify:
            return jsonify({"status": "erro", "mensagem": "Produto não encontrado para atualização"}), 404
        # Validação do campo disponivel, deve ser "Ativo" ou "Inativo", caso contrário, retorna erro
        if disponivel:
            disponivel = 1
        elif not disponivel:
            disponivel = 0
        else:
            return jsonify({"status": "erro", "mensagem": "Campo 'disponivel' deve ser 'Ativo' ou 'Inativo'"}), 400
        # Validação dos campos obrigatórios, se algum campo não for fornecido, retorna erro
        if not all([sabor, preco_pf, preco_cnpj, quantidade_kg, disponivel is not None]):
            return jsonify({"status": "erro", "mensagem": "Todos os campos são obrigatórios"}), 400
        atualizar_produto(sabor, preco_pf, preco_cnpj, quantidade_kg, disponivel)
        registrar_log(nome_usuario, id_usuario, f"Atualizou o produto {sabor}")
        return jsonify({"status": "sucesso", "mensagem": "Produto atualizado com sucesso!"}), 200
    except ValueError as ve:
        return jsonify({"status": "erro", "mensagem": str(ve)}), 404
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500
    
# -------------------------
# Api's Dashboard
# -------------------------
@app.route('/api/dashboard/volume-vendido', methods=['GET'])
@jwt_required()
def volume_vendido_kg():
    try:
        dados = obter_volume_vendido_mes()
        return jsonify({"status": "sucesso", "dados": dados}), 200
    except ValueError as ve:
        return jsonify({"status": "erro", "mensagem": str(ve)}), 400
    except Exception as e:
        return jsonify({"status": "erro", "mensagem":str(e)}), 500

# -------------------------
# Api's Gerenciar Estoque
# -------------------------
@app.route('/api/estoque/tabela', methods=['GET'])
@jwt_required()
def tabela_estoque_completa():
    # Obter a tabela completa de estoque do banco de dados
    try:
        # Separa os dados necessários para a resposta
        dados = tabela_produtos()
        return jsonify({"status": "sucesso", "dados": dados}), 200
    # Tratamento de erros específicos
    except ValueError as ve:
        return jsonify({"status": "erro", "mensagem": str(ve)}), 400
    except Exception as e:
        return jsonify({"satus": "erro", "mensagem": str(e)}), 500
    
@app.route('/api/estoque/produtos', methods=['GET'])
@jwt_required()
def produtos_estoque():
    try:
        # Obter a lista de produtos do estoque do banco de dados
        dados = obter_nome_produtos()
        return jsonify({"status": "sucesso", "dados": dados}), 200
    # Tratamento de erros específicos
    except ValueError as ve:
        return jsonify({"status": "erro", "mensagem": str(ve)}), 400
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500

@app.route('/api/estoque/metricas', methods=['GET'])
@jwt_required()
def metricas_estoque():
    try:
        dados = obter_metricas_estoque()
        return jsonify(dados), 200
    except ValueError as ve:
        return jsonify({'status': 'erro', 'mensagem': str(ve)}), 400
    except Exception as e:
        return jsonify({'status': 'erro', 'mensagem': str(e)}), 500

@app.route('/api/estoque/movimentacoes', methods=['POST'])
@jwt_required()
def movimentacoes_estoque():
    try:
        dados = request.get_json()
        sabor = dados.get('sabor')
        quantidade_kg = dados.get('quantidade_kg')
        validade = dados.get('validade')
        acao = dados.get('acao')

        if not all([sabor, quantidade_kg, acao]):
            return jsonify({'satus': 'erro', 'mensagem': 'Nao foi possível obter todas as informações'}), 400
        
        registrar_movimentacoes(sabor, quantidade_kg, validade, acao)
        return jsonify({'status': 'sucesso', 'mensagem': 'Movimentação registrada com sucesso!'}), 201
        
    except Exception as e:
        return jsonify({'status': 'erro', 'mensagem': str(e)}), 500
    
# -------------------------
# APIs Funcionários
# -------------------------
@app.route('/api/funcionarios/metricas', methods=['GET'])
@jwt_required()
def funcionarios_metricas():
    try:
        # Obter as métricas dos funcionários do banco de dados
        dados = obter_metricas_funcionarios()
        total_funcionarios = dados.get('total_funcionarios', 0)
        total_cargos = dados.get('total_cargos', 0)
        funcionarios_ativos = dados.get('funcionarios_ativos', 0)
        # Retornar as métricas em formato JSON
        return jsonify({
            "total_funcionarios": total_funcionarios,
            "total_cargos": total_cargos,
            "funcionarios_ativos": funcionarios_ativos
        }), 200
    except ValueError as ve:
        return jsonify({"status": "erro", "mensagem": str(ve)}), 400
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500

@app.route('/api/funcionarios/tabela', methods=['GET'])
@jwt_required()
def tabela_funcionarios_completa():
    try:
        # Obter a lista completa de funcionários do banco de dados
        lista_funcionarios = tabela_funcionarios()
        # Separa os dados necessários para a resposta
        dados = [
            {
                "nome": f["nome"],
                "username": f["username"],
                "role": f["role"].capitalize() if f.get("role") else "Funcionário",
                "empresa": f["empresa"],
                "ultimo_acesso": f["ultimo_acesso"]
            }
            for f in lista_funcionarios
        ]
        return jsonify({"status": "sucesso", "dados": dados}), 200
    except ValueError as ve:
        return jsonify({"status": "erro", "mensagem": str(ve)}), 400
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500
    
@app.route('/api/funcionarios/cadastrar', methods=['POST'])
@jwt_required()
def cadastrar_funcionario_db():
    try:
        # Informações do usuário
        username = get_jwt_identity()
        info_user = obter_info_usuario_por_username(username)
        role_usuario = info_user['role'].lower()
        id_usuario = info_user['user_id']
        # Verificar se o usuário é gerente
        if role_usuario != 'gerente' and role_usuario != 'desenvolvedor':
            return jsonify({"status": "erro", "mensagem": "Acesso negado. Apenas gerentes podem cadastrar funcionários."}), 403
        else:
            # Dados do funcionário
            dados = request.get_json()
            nome = dados.get('nome')
            username_add = dados.get('username')
            password = dados.get('password')
            role = dados.get('role')
            empresa = dados.get('empresa')
            # Validação dos campos
            if not all([nome, username, password, role, empresa]):
                return jsonify({"status": "erro", "mensagem": "Todos os campos são obrigatórios"}), 400
            # Registrar funcionário no banco de dados
            cadastro_funcionario(nome, username_add, password, role, empresa)
            registrar_log(username, id_usuario, f"Cadastrou o funcionário {nome}")
            return jsonify({"status": "sucesso", "mensagem": "Funcionário cadastrado com sucesso!"}), 201
    # Tratamento de erros específicos
    except ValueError as ve:
        return jsonify({"status": "erro", "mensagem": str(ve)}), 400
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500
    
@app.route('/api/funcionarios/deletar', methods=['DELETE'])
@jwt_required()
def deletar_funcionario_db():
    try:
        # Informações do usuário
        username = get_jwt_identity()
        info_user = obter_info_usuario_por_username(username)
        id_usuario = info_user['user_id']
        role_usuario = info_user['role'].lower()
        # Verificar se o usuário é gerente
        if role_usuario != 'gerente' and role_usuario != 'desenvolvedor':
            return jsonify({"status": "erro", "mensagem": "Acesso negado. Apenas gerentes podem deletar funcionários."}), 403
        else:
            dados = request.get_json()
            username_funcionario = dados.get('username')
            password_funcionario = dados.get('password')
            # Obter nome do funcionário para logs
            dados_usuario = obter_info_usuario_por_username(username_funcionario)
            nome_usuario = dados_usuario['nome'] if dados_usuario else username_funcionario
            # Validação do campo username
            if not username_funcionario:
                return jsonify({"status": "erro", "mensagem": "Campo 'username' é obrigatório para deletar funcionário"}), 400
            # Usuário é burro e vai tentar deletar a si mesmo
            if username_funcionario == username:
                return jsonify({"status": "erro", "mensagem": " BURRO! Você não pode deletar a si mesmo!"}), 400
            deletar_funcionario(username_funcionario, password_funcionario)
            registrar_log(username, id_usuario, f"Deletou o funcionário {nome_usuario}")
            return jsonify({"status": "sucesso", "mensagem": "Funcionário deletado com sucesso!"}), 200
    except ValueError as ve:
        return jsonify({"status": "erro", "mensagem": str(ve)}), 404
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)