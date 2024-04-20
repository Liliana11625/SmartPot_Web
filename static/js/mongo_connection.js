const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://halcorporation40:151081halco@smarpot.iddzpk2.mongodb.net/?retryWrites=true&w=majority&appName=smarpot";
const client = new MongoClient(uri);

async function conectarDatabase() {
    try {
        await client.connect();
        console.log("Conexión a la base de datos exitosa.");
        return client.db("smarpot");
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error);
        throw error;
    }
}

// Llamada a la función de conexión
conectarDatabase();
