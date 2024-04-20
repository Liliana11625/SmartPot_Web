from pymongo import MongoClient

class MongoConnection:
    def __init__(self, uri):
        self.uri = uri
        self.client = None
        self.db = None

    def get_database(self):
        return self.db

    def conectar_database(self):
        try:
            if not self.client:
                self.client = MongoClient(self.uri)
            self.db = self.client.smarpot
            return self.db
        except Exception as e:
            print(f'Error al conectar a la base de datos: {str(e)}')
            raise e

    def close_connection(self):
        try:
            if self.client:
                self.client.close()
                self.client = None
                self.db = None
                print("Conexión cerrada.")
        except Exception as e:
            print(f'Error al cerrar la conexión: {str(e)}')
            raise e

