//archivo para la configuracion de apollo
import { ApolloServer } from "apollo-server"; //importa apollo server
import { typeDefs } from "./db/schema.js";
import { resolvers } from "./db/resolvers.js";
import conectarBD from "./config/db.js"
import  jwt  from "jsonwebtoken";
import { config } from "dotenv";

conectarBD();
//para que pueda funcionar graphql requiere de un schema y un resolver

config({ path: 'variables.env' });

//crea un servidor: necesita schema que es tydefs y necesita resolvers que es lo que consulta a la BD y trae los datos y schema es el que define los datos que se mostraran
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req})=>{ //context hace que este disponible en todos los resolvers la informacion
        // console.log(req.headers);
       const token = (req.headers['authorization'] || ''); //se captura el token que llega por headers
        if(token){
            try {
                //verificamos el token que recibimos que pasamos como primer parametro y segundo la palabra secreta
                const usuario = jwt.verify(token.replace('Bearer ', ''), process.env.SECRETA); 

                // console.log(usuario);

                return { //hacemos disponible la informacion poniendola en el return
                    usuario
                } 
            } catch (error) {
                console.log(error);
                return error;
            }
        }
    }
    
});


//arrancamos el servidor
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at: ${url}`);
})