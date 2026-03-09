from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from core.database import registrar_usuario, login_usuario, obter_relatorio_vendas
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
    verify = login_usuario(username, password)

    try:
        if verify:
            access_token = create_access_token(identity=username)
            return jsonify(access_token=access_token), 200
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