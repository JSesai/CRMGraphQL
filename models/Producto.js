// Importa el módulo Mongoose para interactuar con la base de datos MongoDB.
import mongoose from "mongoose";

// Define el esquema del producto utilizando la función `Schema` de Mongoose.
const productoSchema = mongoose.Schema({
  // Nombre del producto como una cadena de texto obligatoria y recortada.
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  // Cantidad en existencia del producto como un número obligatorio.
  existencia: {
    type: Number,
    required: true,
    trim: true
  },
  // Precio del producto como un número obligatorio.
  precio: {
    type: Number,
    required: true,
    trim: true
  },
  // Fecha de creación del producto con valor predeterminado de la fecha y hora actuales.
  creado: {
    type: Date,
    default: Date.now()
  }
}, {
  // Configuración adicional del esquema, en este caso, la inclusión de timestamps (createdAt, updatedAt).
  timestamps: true
});

// Crea un índice de texto en el campo "nombre" para facilitar las búsquedas de texto completo.
productoSchema.index({ nombre: 'text' });

// Crea el modelo "Producto" utilizando el esquema definido anteriormente.
const Producto = mongoose.model('Producto', productoSchema);

// Exporta el modelo "Producto" para que pueda ser utilizado en otros archivos de la aplicación.
export default Producto;
