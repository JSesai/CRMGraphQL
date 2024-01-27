import Usuario from "../models/Usuario.js"; //importamos el modelo de usuario
import bcrypt, {genSalt} from "bcrypt"

//resolvers
export const resolvers = {
    Query: {
        obtenerCurso: () => "CURSO DE JULIO"

    },
    Mutation: {
        nuevoUsuario: async (_, { input }) => { //primer parametro es el resultado del padre previo, el segundo es el input(es donde esta nuestra informacion) el tercero es el context pero como no lo requerimos no es necesario ponerlo
            const { email, password } = input;
            //revisar si el usuario ya esta registrado
            const existeUsuario = await Usuario.findOne({ email });
            if (existeUsuario) {
                throw new Error("El usuario ya esta registrado");

            }

            //hashear su password
            const salt = await bcrypt.genSalt(10);//long de hash
            input.password = await bcrypt.hash(password, salt); //asigna a valor password su password pero hasheada
            console.log(input.password);
            return


            //guardarlo en la base de datos
            try {
                const usuario = new Usuario(input); // creamos un nuevo usuario con la palabra reservada new seguido del nombre del modelo y le pasamos como parametros los datos que son necesarios para la creacion y que vienen en el input
                usuario.save(); //guardamos el usuario en la base de datos
                return usuario; //retornamos el usuario que hemos creado y que ya esta guardado 
            } catch (error) {
                console.log(`error de Julio: ${error}`);
            }
        }
    }
}

