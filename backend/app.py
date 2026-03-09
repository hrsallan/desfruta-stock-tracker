from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from core.database import registrar_usuario, login_usuario, obter_relatorio_vendas, registrar_venda, obter_id_por_username, obter_usuario_por_username
import os
from dotenv import load_dotenv


app = Flask(__name__)
CORS(app)
load_dotenv()
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)

@app.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({"status": "pong", "message": "API is running!"}), 200

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
            usuario = obter_usuario_por_username(username)
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

    try:
        registrar_usuario(nome, username, password, role)
        return jsonify({"msg": "Usuário registrado com sucesso!"}), 201
    except Exception as e:
        return jsonify({"msg": "Erro ao registrar usuário", "error": str(e)}), 500


@app.route('/api/me', methods=['GET'])
@jwt_required()
def me():
    username = get_jwt_identity()
    usuario = obter_usuario_por_username(username)

    if not usuario:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    return jsonify({"user": usuario}), 200
    
@app.route('/api/register-venda', methods=['POST'])
@jwt_required()
def register_venda():
    username = get_jwt_identity()
    
    user_id = obter_id_por_username(username)
    
    if not user_id:
        return jsonify({"msg": "Usuário não encontrado no banco de dados"}), 404

    dados = request.get_json()
    produto_id = dados.get('produto_id')
    quantidade_kg = dados.get('quantidade_kg')
    tipo = dados.get('tipo')

    if not all([produto_id, quantidade_kg, tipo]):
        return jsonify({"msg": "Campos incompletos"}), 400

    try:
        registrar_venda(user_id, produto_id, quantidade_kg, tipo)
        return jsonify({
            "msg": "Venda registrada com sucesso!", 
            "vendedor": username
        }), 201
    except Exception as e:
        return jsonify({
            "msg": "Erro ao registrar venda", 
            "error": str(e)
        }), 500

@app.route("/api/relatorio-vendas", methods=['GET'])
@jwt_required()
def get_vendas():
    try:
        dados = obter_relatorio_vendas()
        return jsonify({"status": "sucesso", "dados": dados}), 200
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)