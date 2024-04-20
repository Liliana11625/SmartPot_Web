from flask import Flask, render_template, abort, request,session, redirect, url_for
from mongo_connection import MongoConnection
from bson import ObjectId
from flask import jsonify
from flask import session, redirect, url_for

import os
import pathlib
import requests
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from google.auth.transport import requests as google_requests

app = Flask(__name__)
app.config['SECRET_KEY'] = '@~€lili98764|'

mongo_uri = "mongodb+srv://halcorporation40:151081halco@smarpot.iddzpk2.mongodb.net/?retryWrites=true&w=majority&appName=smarpot";
mongo_connection = MongoConnection(mongo_uri)

#Inicio de  sesion por Oauth ///////////////////////////////////////////////////////////////////////////////

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

GOOGLE_CLIENT_ID = "1079496864365-o7jcnrhfcstmr1hi58lbhonarc0dulhu.apps.googleusercontent.com"
client_secrets_file = os.path.join(pathlib.Path(__file__).parent, "client_secret.json")

flow = Flow.from_client_secrets_file(
    client_secrets_file=client_secrets_file,
    scopes=["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email", "openid"],
    redirect_uri="http://127.0.0.1:5000/callback"
)


def login_is_required(function):
    def wrapper(*args, **kwargs):
        if "google_id" not in session:
            return abort(401)  # Authorization required
        else:
            return function()

    return wrapper


@app.route("/login")
def login():
    authorization_url, state = flow.authorization_url()
    session["state"] = state
    return redirect(authorization_url)

@app.route("/callback")
def callback():
    flow.fetch_token(authorization_response=request.url)

    if not session["state"] == request.args["state"]:
        abort(500)  

    credentials = flow.credentials

    id_info = id_token.verify_oauth2_token(
        id_token=credentials._id_token,
        request=google_requests.Request()
    )

    try:
        db = mongo_connection.conectar_database()
        usuarios = db.usuarios

        correo = id_info.get("email")  

        usuario_existente = usuarios.find_one({'gmail': correo})

        if usuario_existente:
            if 'google_id' not in usuario_existente:
                usuarios.update_one(
                    {'gmail': correo},
                    {'$set': {'google_id': id_info.get("sub"), 'name': id_info.get("name"), 'img': id_info.get("picture")}}
                )
            session['usuario_id'] = str(usuario_existente['_id'])
            session['name'] = usuario_existente['name']
            session['img'] = id_info.get("picture")
        else:
            nuevo_usuario = {
                'google_id': id_info.get("sub"),
                'name': id_info.get("name"),
                'gmail': correo,
                'type': 'google',
                'img': id_info.get("picture") 
            }
            insert_result = usuarios.insert_one(nuevo_usuario)

            session['usuario_id'] = str(insert_result.inserted_id)
            session['name'] = nuevo_usuario['name']
            session['img'] = id_info.get("picture")

        return '<script>alert("Registro exitoso"); window.location.href = "/Principal";</script>'
    except Exception as e:
        return f'Error en el servidor: {str(e)}'
    finally:
        mongo_connection.close_connection()


@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")

# index////////////////////////////////////////////////////////////////////////////////////////////
@app.route('/')
def index():
    try:
        db = mongo_connection.conectar_database() 
        collection = db.usuarios
        
        return render_template('index.html')
    except Exception as e:
        return f'Error en el servidor: {str(e)}'
    finally:
        mongo_connection.close_connection()

# registro////////////////////////////////////////////////////////////////////////////////////////////
@app.route('/registro', methods=['GET', 'POST'])
def registro():
    if request.method == 'POST':
        try:
            db = mongo_connection.conectar_database()

            name = request.form.get('name')
            gmail = request.form.get('gmail')
            password = request.form.get('password')
            verificar_password = request.form.get('verificarContrasena')

            if password != verificar_password:
                return '<script>alert("Las contraseñas no coinciden. Por favor, inténtalo de nuevo.");window.location.href="/registro";</script>'

            if len(password) != 8:
                return '<script>alert("La contraseña debe tener exactamente 8 caracteres.");window.location.href="/registro";</script>'

            if not any(char.isdigit() for char in password) or not any(char.isalpha() for char in password) or not any(char.isalnum() for char in password):
                return '<script>alert("La contraseña debe ser una combinación de números, letras y caracteres especiales.");window.location.href="/registro";</script>'

            usuarios = db.usuarios
            if usuarios.find_one({'gmail': gmail}) is None:
                usuarios.insert_one({
                    'name': name,
                    'gmail': gmail,
                    'password': password,
                    'type': 'user',  
                    'img': ''
                })

                return '<script>alert("Registro exitoso");window.location.href="/inicio_sesion";</script>'
            else:
                return 'El correo electrónico ya está registrado. Por favor, elige otro correo.'
        except Exception as e:
            return f'Error en el servidor: {str(e)}'
        finally:
            mongo_connection.close_connection()

    return render_template('registro.html')


# inicio de sesion////////////////////////////////////////////////////////////////////////////////////////////
@app.route('/inicio_sesion', methods=['GET', 'POST'])
def inicio_sesion():
    if request.method == 'POST':
        gmail = request.form.get('gmail')
        password = request.form.get('password')

        try:
            db = mongo_connection.conectar_database()
            usuario = db.usuarios.find_one({'gmail': gmail, 'password': password})

            if usuario:
                session['usuario_id'] = str(usuario['_id'])
                return redirect(url_for('Principal'))
            else:
                return jsonify({'message': 'Credenciales incorrectas'})
        except Exception as e:
            return jsonify({'message': f'Error en el servidor: {str(e)}'})
        finally:
            mongo_connection.close_connection()

    return render_template('inicio_sesion.html')

# principal////////////////////////////////////////////////////////////////////////////////////////////
@app.route('/Principal')
def Principal():
    return render_template('Principal.html')

# perfil////////////////////////////////////////////////////////////////////////////////////////////
def obtener_informacion_de_usuario(usuario_id):
    try:
        db = mongo_connection.conectar_database()
        usuario = db.usuarios.find_one({'_id': ObjectId(usuario_id)})
        return usuario
    except Exception as e:
        print(f'Error al obtener información del usuario: {str(e)}')
        return None

@app.route('/perfil')
def perfil():
    try:
        if 'usuario_id' not in session:
            return render_template('perfil.html', nombre='No has iniciado sesión', correo='')

        usuario_id = session['usuario_id']
        usuario = obtener_informacion_de_usuario(usuario_id)

        if usuario:
            nombre = usuario['name']
            correo = usuario['gmail']
            img = None  # Inicializamos la URL de la imagen como None
            
            # Verificar el tipo de usuario
            if usuario['type'] == 'user':
                # Usuario normal, usar la imagen predeterminada
                img = url_for('static', filename='img/profile.jpg')
            elif usuario['type'] == 'google':
                # Usuario de Google, usar la imagen de Google
                img = usuario.get('img')

            return render_template('perfil.html', nombre=nombre, correo=correo, img=img)
        else:
            return render_template('perfil.html', nombre='Error', correo='Error')
    except Exception as e:
        print(f'Error en el servidor: {str(e)}')
        return render_template('perfil.html', nombre='Error', correo='Error')

# soporte////////////////////////////////////////////////////////////////////////////////////////////
@app.route('/soporte')
def soporte():
    return render_template('soporte.html')
  
#EliminarPerfil//////////////////////////////////////////////////////////////////////////////////////////////////////
@app.route('/eliminar_perfil', methods=['GET'])
def eliminar_perfil():
    try:
        if 'usuario_id' not in session:
            return jsonify({'message': 'Usuario no autenticado'})

        usuario_id = session['usuario_id']

        db = mongo_connection.conectar_database()
        db.usuarios.delete_one({'_id': ObjectId(usuario_id)})

        session.pop('usuario_id', None)

        return redirect(url_for('index'))
    except Exception as e:
        return jsonify({'message': f'Error en el servidor: {str(e)}'})
    
#cerrarSesion//////////////////////////////////////////////////////////////////////////////////////////////////////
@app.route('/cerrar_sesion')
def cerrar_sesion():
    session.clear()
    # Revocar el token de acceso de Google
    if 'google_id' in session:
        google_id = session['google_id']
        try:
            requests.post('https://accounts.google.com/o/oauth2/revoke',
                          params={'token': google_id},
                          headers={'content-type': 'application/x-www-form-urlencoded'})
        except Exception as e:
            print(f'Error al revocar el token de acceso de Google: {str(e)}')
    return redirect(url_for('inicio_sesion'))

#comentarios///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
@app.route('/obtener_comentarios', methods=['GET'])
def obtener_comentarios():
    db = mongo_connection.conectar_database()
    try:
        comentarios_collection = db['comentarios']
        comentarios = comentarios_collection.find()
        comentarios_list = list(comentarios) 
        comentarios_data = [{
            'title': comentario['title'],
            'content': comentario['content'],
            'rating': comentario['rating']
        } for comentario in comentarios_list]
        return jsonify(comentarios_data)
    except Exception as e:
        return jsonify({'error': f'Error en el servidor: {str(e)}'})

@app.route('/guardar_comentario', methods=['POST'])
def guardar_comentario():
    if request.method == 'POST':
        try:
            data = request.json  
            title = data.get('commentTitle')
            content = data.get('commentContent')
            rating = data.get('commentRating')

            db = mongo_connection.conectar_database()

            comentarios_collection = db['comentarios']
            comentarios_collection.insert_one({
                'title': title,
                'content': content,
                'rating': rating
            })

            return jsonify({'message': 'Comentario insertado correctamente'})

        except Exception as e:
            return jsonify({'error': f'Error en el servidor: {str(e)}'})

# Cerrar la conexión al finalizar la aplicación/////////////////////////////////////////////////////////
@app.teardown_appcontext
def close_mongo_connection(exception=None):
    mongo_connection.close_connection()

if __name__ == '__main__':
    app.run(debug=True)