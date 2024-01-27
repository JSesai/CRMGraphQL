//archivo para la configuracion de apollo
import { ApolloServer } from "apollo-server"; //importa apollo server
import { typeDefs } from "./db/schema.js";
import { resolvers } from "./db/resolvers.js";
import conectarBD from "./config/db.js"

conectarBD();
//para que pueda funcionar graphql requiere de un schema y un resolver

//crea un servidor: necesita schema que es tydefs y necesita resolvers que es lo que consulta a la BD y trae los datos y schema es el que define los datos que se mostraran
const server = new ApolloServer({
    typeDefs,
    resolvers,
    
});


//arrancamos el servidor
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at: ${url}`);
})