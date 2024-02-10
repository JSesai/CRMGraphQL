import mongoose from "mongoose";

const clienteSchema = mongoose.Schema({
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
    empresa: {
        type: String,
        required: true,
        trim:true,
    },
    email: {
        type: String,
        trim:true,
        required: true,
        unique: true
    },
    telefono: {
        type: String,
        trim:true,
        
    },
    vendedor:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    }
},{
    timestamps:true
});

const Cliente = mongoose.model('Cliente', clienteSchema);

export default  Cliente;