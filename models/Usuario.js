import mongoose from "mongoose"; //importamos moonsgoose

//ESQUEMA PARA CREAR USUARIO QUE ES VENDEDOR
const UsuariosSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellido: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        
    },
    creado: {
        type: Date,
        default: Date.now()
    }

},{
    timestamps: true
}
);

const Usuario = mongoose.model("Usuario", UsuariosSchema);
export default Usuario;



