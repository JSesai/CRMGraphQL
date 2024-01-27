import { gql } from "apollo-server"; //importa apollo server

//Schema
//schema es conocido como tipo de definiciones -> typeDefs
export const typeDefs = gql`
    type Usuario {
        id: ID
        nombre: String
        apellido: String
        email: String 
        creado: String       
    }

    input UsuarioInput {
        nombre: String!
        apellido: String!
        email: String!
        password: String!
    }

    type Query {
        obtenerCurso: String
       
    }

    type Mutation{ 
        nuevoUsuario(input: UsuarioInput): Usuario
    }
`;

// Query es el que se ocupa para leer,

//Mutation es para el resto de las operaciones del CRUD,
// se pueden pasar datos por medio de in input pero tambien hay que definir ese input 
// ! signo de exclamacion indican que son obligatorios los campos  