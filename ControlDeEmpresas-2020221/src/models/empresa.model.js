const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const empresaSchema = new Schema({

    idUsuario: { type: Schema.Types.ObjectId, ref: 'Usuarios' },
    nombreEmpleado:String,
    puesto:String,
    departamento:String
    
})

module.exports = mongoose.model('Empresas', empresaSchema);