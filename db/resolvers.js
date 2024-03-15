import Usuario from "../models/Usuario.js"; //importamos el modelo de usuario
import Producto from "../models/Producto.js";
import Cliente from "../models/Cliente.js";
import Pedido from "../models/Pedido.js";
import bcrypt, { genSalt } from "bcrypt"
import { config } from "dotenv";
import jwt from "jsonwebtoken"  //usamos esta libreria npm i jsonwebtoken para generar webtokens
import mongoose, { isValidObjectId } from "mongoose";


config({ path: 'variables.env' });

const crearToken = (user, secretWord, expiration) => {
    const { id, email, nombre, apellido } = user;
    //firma del jwt con 3 cosas: lo que se va a firmar, la palabra secreta y el tiempo de expiracion
    return jwt.sign({ id, email, nombre, apellido }, secretWord, {
        expiresIn: expiration
    })
}

//resolvers
export const resolvers = {
    Query: {
        //usuarios
        obtenerUsuario: async (_, {}, ctx) => {
            return ctx.usuario
        },

        //productos
        obtenerProductos: async () => {
            try {
                const productos = await Producto.find({}); //con find y pasando un objeto vacio se trae todos los productos
                return productos;
            } catch (error) {
                console.log(error);
            }
        },

        obtenerProducto: async (_, { id }) => {

            //validar formato valido de id de mongo
            const formatoValidoId = mongoose.Types.ObjectId.isValid(id);
            if (!formatoValidoId) {
                throw new Error('Formato de id no valido');
            }

            //buscar producto
            const productoBuscado = await Producto.findById(id);

            //validar si no existe el producto
            if (!productoBuscado) {
                throw new Error('Producto inexistente');
            }

            return productoBuscado;


        },

        buscarProducto: async (_, { texto }) => {
            const productos = await Producto.find({ $text: { $search: texto } }).limit(10); //buscada del texto en el 
            return productos;
        },

        obtenerClientes: async () => {
            try {
                const clientes = await Cliente.find({});
                return clientes;
            } catch (error) {
                console.log(error);
            }
        },

        obtenerClientesVendedor: async (_, { }, ctx) => { //obtiene los clientes que fueron dados de alta por el vendedor, por lo que cada vendedor debe ver sus propios clientes a ecxepcion del admin que puede ver todo
            try {
                //se hace la busqueda filtrando por el vendedor que esta logueado y disponible en context y clnvertimos a string para comprar
                const clientes = await Cliente.find({ vendedor: ctx.usuario.id.toString() });
                return clientes;
            } catch (error) {
                console.log(error);
            }

        },

        obtenerCliente: async (_, { id }, ctx) => {
            //validar formato del id
            const idValido = mongoose.Types.ObjectId.isValid(id);
            if (!idValido) throw new Error('El formato de id es incalido');
            //validar si el usuario existe
            const clienteRequerido = await Cliente.findById(id);
            if (!clienteRequerido) throw new Error('Usuario no encontrado');

            //validar si el solicitante es el vendor que lo creo
            if (clienteRequerido.vendedor.toString() !== ctx.usuario.id.toString()) {
                throw new Error('Sin permisos para ver este cliente');
            }

            // retornar cliente
            return clienteRequerido;
        },

        // obtenerPedidos: async (_, { }, ctx) => {
        //     try {
        //         const pedidos = await Pedido.find({});
        //         return pedidos
        //     } catch (error) {
        //         console.log(error);
        //     }
        // },

        obtenerPedidosVendedor: async (_, { }, ctx) => {
            //validar que el vendedor sea el usuario que esta logueado
            console.log('entrando...');
            const pedidos = await Pedido.find({ vendedor: ctx.usuario.id }).populate('cliente');
            console.log(pedidos);
            if (!pedidos) throw new Error('No tienes pedidos');
            return pedidos
        },

        obtenerUnPedido: async (_, { id }, ctx) => {
            //validar el formato del id
            const idValido = mongoose.Types.ObjectId.isValid(id);
            if (!idValido) throw new Error('El formato del id es invalido');

            //validar que exista el pedido
            const pedidoBuscado = await Pedido.findById(id);
            if (!pedidoBuscado) throw new Error('El pedido no existe');

            //comprobar que sea el vendedor que hizo el pedido
            if (pedidoBuscado.vendedor.toString() !== ctx.usuario.id) throw new Error('No tienes permisos');

            return pedidoBuscado;
        },

        obtenerPedidosEstado: async (_, { estado } , ctx) => {
            //validar que el estado sea valido 
            const estadosValidos = ['PENDIENTE', 'COMPLETADO', 'CANCELADO'];
            if (!estadosValidos.includes(estado)) throw new Error('Estado invalido');
            //validar que el usuario sea el vendedor
            const pedidos = await Pedido.find({ vendedor: ctx.usuario.id, estado });
            if (!pedidos) throw new Error('No tienes pedidos');
            //retornar resultados[]
            return pedidos;
        },

        mejoresClientes: async() => {
            const clientes = await Pedido.aggregate([
                { $match: { estado: "COMPLETADO" } },
                { $group: { _id: "$cliente", total: { $sum: "$total" } } },
                { $lookup: { from: "clientes", localField: "_id", foreignField: "_id", as: "cliente" } },
                { $limit: 10 },
                { $sort: { total: -1 } }
            ]);

            return clientes;
        },

        mejoresVendedores: async() => {
            const vendedores = await Pedido.aggregate([
                { $match: { estado: "COMPLETADO" } },
                { $group: { _id: "$vendedor", total: { $sum: "$total" } } },
                { $lookup: { from: "usuarios", localField: "_id", foreignField: "_id", as: "vendedor" } },
                { $limit: 3 },
                { $sort: { total: -1 } }
            ]);
                        
            return vendedores;
        }


        

    },
    Mutation: {
        //usuarios
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


            //guardarlo en la base de datos
            try {
                const usuario = new Usuario(input); // creamos un nuevo usuario con la palabra reservada new seguido del nombre del modelo y le pasamos como parametros los datos que son necesarios para la creacion y que vienen en el input
                usuario.save(); //guardamos el usuario en la base de datos
                return usuario; //retornamos el usuario que hemos creado y que ya esta guardado 
            } catch (error) {
                console.log(`error de Julio: ${error}`);
            }
        },

        autenticarUsuario: async (_, { input }) => {
            const { email, password } = input;

            const existeUsuario = await Usuario.findOne({ email }); //buscar al usuario, si lo encuentra regresa el objeto si no regresa null
            if (!existeUsuario) { //si el usuario no existe
                throw new Error('El usuario no existe'); //arroja un nuevo error
            }

            //comparar password ingresado con el almacenado
            const passwordCorrecto = await bcrypt.compare(password, existeUsuario.password); //comparamos los paswords uno esta hasheado y el otro no por lo que este metodo es util para poder compararlos y saber si el password que se esta ingresando es igual que al que esta en la base de datos
            //si no son iguales
            if (!passwordCorrecto) throw new Error('La contraseña es incorrecta');

            return {
                token: crearToken(existeUsuario, process.env.SECRETA, '24h') //requiere de lo que va a convertir en JWT, la palabra secreta y el tiempo de exiracion
            }


        },

        //Productos
        nuevoProducto: async (_, { input }) => {
            const { nombre } = input;
            //verificar si el producto existe
            const productoEncontrado = await Producto.findOne({ nombre });
            if (productoEncontrado) {
                throw new Error('Producto ya existente!!');
            }

            const nuevoProducto = new Producto(input);//instancia del modelo con los datos
            const resultado = await nuevoProducto.save();
            return resultado;

            //guardar en la bd
        },

        actualizarProducto: async (_, { id, input }) => {
            //validar formato de id valido
            const formatoValidoId = mongoose.Types.ObjectId.isValid(id);
            if (!formatoValidoId) {
                throw new Error('Formato de id no valido');
            }

            //buscar producto
            let productoActualizar = await Producto.findById(id);
            //validar que exista producto
            if (!productoActualizar) throw new Error('No existe el producto');

            //editar procucto
            //actualizamos documento encontrado, recibe entre llaves el id que va actualizar, los datos a actualizar, y el tercer valor indica que debe de retornar el valor actualizado de lo contrario regresa el documento no actualizado
            productoActualizar = await Producto.findOneAndUpdate({ _id: id }, input, { new: true });

            //retornar producto
            return productoActualizar;
        },

        eliminarProducto: async (_, { id }) => {
            //validar formato de id valido
            const idValido = mongoose.Types.ObjectId.isValid(id);
            if (!idValido) throw new Error('Formato invalido');

            //buscar producto
            let producto = await Producto.findById(id);

            //validar si existe
            if (!producto) throw new Error('El producto no existe');

            try {
                //elminar producto
                await producto.deleteOne();

            } catch (error) {
                console.log(error);
            }

            //retornar String de producto eliminado
            return 'Producto Eliminado'
        },
 
        //Clientes
        nuevoCliente: async (_, { input }, ctx) => {
            const { email } = input;
            console.log('mandaste este mail', email);

            //Validar que no este registrado el email
            const clienteExiste = await Cliente.findOne({ email }); //buscar cliente por email
            if (clienteExiste) throw new Error('Correo ya registrado'); //si existe el corre

            //crear una instancia del modelo
            const clienteNuevo = await new Cliente(input);

            //asignar el vendedor por medio de la informacion que se encuentra en el context, que es el usuario que esta autenticado

            clienteNuevo.vendedor = ctx.usuario.id;
            console.log('usuario id resolver');
            console.log(ctx.usuario);

            try {
                const resultado = await clienteNuevo.save();
                return resultado;
            } catch (error) {
                console.log(error);
            }


        },

        actualizarCliente: async (_, { id, input }, ctx) => {

            //validar si el id es formato valido
            const validarId = mongoose.Types.ObjectId.isValid(id);

            if (!validarId) throw new Error('El formato de id es invalido'); // si no existe arrojamos un nuevo error
            // velidar si existe el cliente
            const clienteEditar = await Cliente.findById(id);
            if (!clienteEditar) throw new Error('El cliente no existe');

            //verificar si el vendedor que lo dio de alta es quien esta editando
            if (clienteEditar.vendedor.toString() !== ctx.usuario.id.toString()) {
                // console.log(clienteEditar.vendedor.toString());
                // console.log(ctx.usuario.id.toString());

                throw new Error('Accion no permitida');
            }

            //guardar cliente
            const actualizarCliente = await Cliente.findOneAndUpdate({ _id: id }, input, { new: true });
            return actualizarCliente;



        },

        eliminarCliente: async (_, { id }, ctx) => {
            //validar que el formato del id sea valido
            const idValido = mongoose.Types.ObjectId.isValid(id);
            if (!idValido) throw new Error('Formato de ID invalido');

            //validar que el usuario que se dese eliminar exista
            const clienteEliminar = await Cliente.findById(id);
            if (!clienteEliminar) throw new Error('Cliente no existe');

            //validar que sea el vendedor que lo creo quien pueda eliminarlo
            if (clienteEliminar.vendedor.toString() !== ctx.usuario.id.toString()) {
                throw new Error('No tienes permisos para eliminar este usuario');
            }

            //eliminarlo de la BD
            await Cliente.findOneAndDelete({ _id: id })
            return 'Cliente eliminado correctamente'

        },

        //pedidos
        nuevoPedido: async (_, { input }, ctx) => {
            const { cliente, pedido } = input;
            // console.log(pedido);
            //verificar que el cliente exista
            let clienteExiste = await Cliente.findById(cliente);
            if (!clienteExiste) throw new Error('El cliente no existe');

            //verificar si el cliente es del vendedor que esta logeado
            // console.log(clienteExiste.vendedor.toString());
            // console.log(ctx.usuario.id);
            if (clienteExiste.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes permisos para esta operacion de este usuario');
            }

            //revisar que el stock este disponible
            for await (const articulo of pedido) {
                const { id } = articulo;
                const producto = await Producto.findById(id);
                // console.log(producto);

                if (articulo.cantidad > producto.existencia) {
                    throw new Error(`El articulo: ${producto.nombre} excede la cantidad disponible`);
                } else {
                    //restar la cantidad del pedido a la existencia
                    producto.existencia -= articulo.cantidad;
                    //guardar en la bd
                    await producto.save();
                }
            }

            //crear un nuevo pedido
            const nuevoPedido = new Pedido(input);
            console.log(nuevoPedido);
            //asignarle un vendedor
            nuevoPedido.vendedor = ctx.usuario.id;
            //guardarlo en la BD
            const resultado = await nuevoPedido.save();
            return resultado;

        },

        actualizarPedido: async (_, { id, input }, ctx) => {
            const { cliente } = input;
            // validar que el id sea valido
            const idValido = mongoose.Types.ObjectId.isValid(id);
            if (!idValido) throw new Error("Formato de id Invalido");

            //validar que exista el pedido
            const existePedido = await Pedido.findById(id);
            if (!existePedido) throw new Error("El pedido no existe");

            //validar si el cliente existe
            const existeCliente = Cliente.findById(cliente);
            if (!existeCliente) throw new Error("El cliente no existe");

            //validar que el usuario logueado sea quien hizo la venta
            if (existePedido.vendedor.toString() !== ctx.usuario.id) throw new Error("No tienes permiso para esta acción");

            //validar que sea el cliente 
            if (cliente !== existePedido.cliente.toString()) throw new Error("No es el mismo cliente");
                console.log(input);
            
            const pedidoActualizado = Pedido.findOneAndUpdate({ _id: id }, input, { new: true });

            //devolver pedido actualizado
            return pedidoActualizado;
        },

        eliminarPedido: async (_, {id}, ctx) => {
            // calidar que el id sea valido
            const idValido = mongoose.Types.ObjectId.isValid(id);
            if(!idValido) throw new Error("Formato invalido de id");

            //buscar pedido
            const pedidoBuscado = await Pedido.findById(id);
            if(!pedidoBuscado) throw new Error("El pedido no existe");

            //validar que el usuario logueado(vendedor) sea el que elimina
            if(pedidoBuscado.vendedor.toString() !== ctx.usuario.id) throw new Error("Acción no permitida para ti")
            
            await Pedido.findOneAndDelete({_id: id});

            return "Pedido eliminado correctamente"
        }



    }
}


