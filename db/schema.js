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

    type Token {
        token: String
    }

    type Producto {
        id: ID
        nombre: String
        existencia: Int
        precio: Float
        creado: String
    }

    type Cliente {
        id: ID
        nombre: String
        apellido: String
        empresa: String
        email: String
        telefono: String
        vendedor: ID
    }

    type Pedido {
        id: ID
        pedido: [PedidoGrupo]
        total: Float
        cliente: Cliente
        vendedor: ID
        fecha: String
        estado: EstadoPedido
    }   

    type PedidoGrupo {
        id: ID
        cantidad: Int
        nombre: String
        precio: Float
    }

    type TopCliente {
        total: Float
        cliente: [Cliente]
    }

    type TopVendedor {
        total: Float
        vendedor: [Usuario]
    }
   
    input UsuarioInput {
        nombre: String!
        apellido: String!
        email: String!
        password: String!
    }

    input AutenticartInput {
        email: String!
        password: String!
    }

    input ProductoInput {
        nombre: String!
        existencia: Int!
        precio: Float!
    }

    input ClienteInput {
        nombre: String!
        apellido: String!
        empresa: String!
        email: String!
        telefono: String
        
    }

    input PedidoProductoInput{
        id: ID
        cantidad: Int
        nombre: String
        precio: Float
    }

    input PedidoInput {
        pedido: [PedidoProductoInput]
        total: Float
        cliente: ID
        estado: EstadoPedido
    }

    enum EstadoPedido {
        PENDIENTE
        COMPLETADO
        CANCELADO
    }

    type Query {
        #querys para usuarios
        obtenerUsuario: Usuario

        #querys para productos
        obtenerProductos: [Producto]
        obtenerProducto(id: ID!) : Producto
        buscarProducto(texto: String!): [Producto]

        #clientes
        obtenerClientes: [Cliente]
        obtenerClientesVendedor: [Cliente]
        obtenerCliente(id: ID!): Cliente

        #pedidos
        #obtenerPedidos: [Pedido]
        obtenerPedidosVendedor: [Pedido]
        obtenerUnPedido(id: ID!): Pedido
        obtenerPedidosEstado(estado: String!): [Pedido]

        #Busquedas avanzadas
        mejoresClientes: [TopCliente]
        mejoresVendedores: [TopVendedor]

    }

    type Mutation { 
        #usuarios
        nuevoUsuario(input: UsuarioInput): Usuario
        autenticarUsuario(input: AutenticartInput): Token

        #Productos
        nuevoProducto(input: ProductoInput): Producto
        actualizarProducto(id: ID!, input: ProductoInput): Producto
        eliminarProducto(id: ID!): String

        #Clientes
        nuevoCliente(input: ClienteInput): Cliente
        actualizarCliente(id: ID!, input: ClienteInput): Cliente
        eliminarCliente(id: ID!): String

        #pedidos
        nuevoPedido(input: PedidoInput): Pedido 
        actualizarPedido(id: ID!, input: PedidoInput): Pedido
        eliminarPedido(id: ID!): String        
    }
`;

// Query es el que se ocupa para leer,

//Mutation es para el resto de las operaciones del CRUD,
// se pueden pasar datos por medio de in input pero tambien hay que definir ese input
// ! signo de exclamacion indican que son obligatorios los campos  