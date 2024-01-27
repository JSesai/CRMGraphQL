import mongoose from "mongoose"; //Libreria de ORM para manejar mongo facilmente
import { config } from 'dotenv'; // imoprtacion de config de varibales de entorno

// Luego configura las variables de entorno desde el archivo
config({ path: 'variables.env' }); //configuramos

//se hace la coneccion con ayuda de mongoose que ya fue instalado con npm i mongoose, el metodo connect recibe 2 parametros: la cadena de conexion la optienes de atlasy otras opciones
const conectarBD = async () => {
    try {
        console.log(process.env.DB_MONGO);
        //metodo connect de mongoose para conectarse, se le pasa el string de conexion de compas que esta guardado en archivo env para no exponer las variables de entorno
        const conecction = await mongoose.connect(process.env.DB_MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        const url = `${conecction.connection.host} : ${conecction.connection.port}`;
        console.log('Mongo db conectado en:', url);
        console.log('Mongo Uri:', process.env.DB_MONGO);
    } catch (error) {
        console.log('Error:', error.message);
        process.exit(1); //detiene la aplicacion
    }
}

export default conectarBD;