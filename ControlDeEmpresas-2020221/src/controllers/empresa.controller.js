const Empresas = require('../models/usuario.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');
const Usuario = require('../models/usuario.model');


function agregarEmpresa(req, res) {
    const parametros = req.body;
    const modeloEmpresas = new Empresas();

    if(parametros.empresa){

        modeloEmpresas.usuario = null;
        modeloEmpresas.empresa = parametros.empresa;
        modeloEmpresas.rol = 'ROL_EMPRESA';
        modeloEmpresas.email = parametros.email;
        modeloEmpresas.password = parametros.password;

        Empresas.find({ email : parametros.email }, (err, usuarioEncontrado) => {
            if ( usuarioEncontrado.length == 0 ) {

                bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                    modeloEmpresas.password = passwordEncriptada;

                    modeloEmpresas.save((err, usuarioGuardado) => {
                        if (err) return res.status(500)
                            .send({ mensaje: 'Error en la peticion' });
                        if(!usuarioGuardado) return res.status(500)
                            .send({ mensaje: 'Error al agregar el Usuario'});
                        
                        return res.status(200).send({ usuario: usuarioGuardado });
                    });
                });                    
            } else {
                return res.status(500)
                    .send({ mensaje: 'Este correo, ya  se encuentra utilizado' });
            }
        })

    } else {
        return res.status(400).send({ mensaje: 'Debe enviar los parametros obligatorios.' })
    }
}


function eliminarEmpresaADefault(req, res) {
    const empresaId = req.params.idEmpresa;

    Empresas.findOne({ _id: empresaId, idAdmin: req.user.sub }, (err, empresaAdmin)=>{
        if(!empresaAdmin){
            return res.status(400).send({ mensaje: 'No puede editar empresas que no fueron creados por su persona'});
        } else {
            Empresas.findOne({ empresa : 'Por Defecto' }, (err, empresaEncontrada) => {
                if(!empresaEncontrada){

                    const modeloEmpresa = new Empresa();
                    modeloEmpresa.empresa = 'Por Defecto';
                    modeloEmpresa.idUsuario = null;

                    modeloEmpresa.save((err, empresaGuardada)=>{
                        if(err) return res.status(400).send({ mensaje: 'Error en la peticion de Guardar empresa'});
                        if(!empresaGuardada) return res.status(400).send({ mensaje: 'Error al guardar la empresa'});

                        Asignacion.updateMany({ idEmpresa: empresaId }, { idEmpresa: empresaGuardada._id }, 
                            (err, asignacionesEditadas) => {
                                if(err) return res.status(400)
                                    .send({ mensaje: 'Error en la peticion de actualizar asignaciones'});
                                
                                Empresas.findByIdAndDelete(empresaId, (err, empresaEliminado)=>{
                                    if(err) return res.status(400).send({ mensaje: "Error en la peticion de eliminar empresa"});
                                    if(!empresaEliminado) return res.status(400).send({ mensaje: 'Error al eliminar el empresa'});

                                    return res.status(200).send({ 
                                        editado: asignacionesEditadas,
                                        eliminado: empresaEliminado
                                    })
                                })
                            })
                    })

                } else {

                    Asignacion.updateMany({ idEmpresa: empresaId }, { idEmpresa: empresaEncontrado._id }, 
                        (err, asignacionesActualizadas) => {
                            if(err) return res.status(400).send({ mensaje:"Error en la peticion de actualizar asignaciones"});

                            Empresas.findByIdAndDelete(empresaId, (err, empresaEliminado)=>{
                                if(err) return res.status(400).send({ mensaje: "Error en la peticion de eliminar empresa"});
                                if(!empresaEliminado) return res.status(400).send({ mensaje: "Error al eliminar la empresa"});

                                return res.status(200).send({ 
                                    editado: asignacionesActualizadas,
                                    eliminado: empresaEliminado
                                })
                            })
                        })

                }
            })
        }
    })


}
function editarEmpresa(req, res) {
    var idUser = req.params.idUsuario;
    var parametros = req.body;    

    if ( idUser !== req.user.sub ) return res.status(500)
        .send({ mensaje: 'No puede editar otros usuarios'});

    Usuario.findByIdAndUpdate(req.user.sub, parametros, {new : true},
        (err, usuarioActualizado)=>{
            if(err) return res.status(500)
                .send({ mensaje: 'Error en la peticion' });
            if(!usuarioActualizado) return res.status(500)
                .send({ mensaje: 'Error al editar el Usuario'});
            
            return res.status(200).send({usuario : usuarioActualizado})
        })
}
  

module.exports = {
    agregarEmpresa,
    editarEmpresa,
    eliminarEmpresaADefault
}