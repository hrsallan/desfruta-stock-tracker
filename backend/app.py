from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from core.database import registrar_usuario, login_usuario, obter_id_por_username, obter_usuario_por_username, verificar_produtos_disponiveis
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

@app.route("/api/menu/produtos-disponiveis", methods=['GET'])
@jwt_required()
def produtos_disponiveis():
    try:
        dados = verificar_produtos_disponiveis()
        return jsonify({"status": "sucesso", "dados": dados}), 200
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)