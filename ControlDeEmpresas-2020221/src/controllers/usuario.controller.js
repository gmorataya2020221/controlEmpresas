const Usuario = require('../models/usuario.model');
const Empresa = require('../models/empresa.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');

function agregarEmpleado(req, res) {
    const parametros = req.body;
    const modeloEmpresas = new Empresa();

    if(parametros.empresa){
        modeloEmpresas.idUsuario = req.user.sub;
        modeloEmpresas.nombreEmpleado= parametros.nombreEmpleado;
        modeloEmpresas.puesto= parametros.puesto;
        modeloEmpresas.departamento= parametros.departamento;


        modeloEmpresas.save((err, empleadoGuardado) => {
            if(err) return res.status(400).send({ mensaje: 'Erorr en la peticion.' });
            if(!empleadoGuardado) return res.status(400).send({ mensaje: 'Error al agregar al empleado.'});

            return res.status(200).send({ empleados: empleadoGuardado });
        })

    } else {
        return res.status(400).send({ mensaje: 'Debe enviar los parametros obligatorios.' })
    }
}

function RegistrarAdmin(req, res) {
    var usuarioModel = new Usuario();


    usuarioModel.usuario = 'Admin';
    usuarioModel.email = null;
    usuarioModel.password = '123456';
    usuarioModel.rol = 'ROL_ADMIN';
    usuarioModel.empresa = null;

    Usuario.find({ nombre : 'Admin' }, (err, usuarioEncontrado) => {
        if ( usuarioEncontrado.length == 0 ) {

            bcrypt.hash('123456', null, null, (err, passwordEncriptada) => {
                usuarioModel.password = passwordEncriptada;

                usuarioModel.save((err, usuarioGuardado) => {
                    if (err) console.log('Error en la peticion');
                    if(!usuarioGuardado) console.log('Error al agregar al admin');
                    
                    console.log({ usuario: usuarioGuardado });
                });
            });                    
        } else {
            return console.log('Este correro ya se encuentra en uso');
        }
    })
    
}


function Login(req, res) {
    var parametros = req.body;
    Usuario.findOne({ email : parametros.email }, (err, usuarioEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if(usuarioEncontrado){
            bcrypt.compare(parametros.password, usuarioEncontrado.password, 
                (err, verificacionPassword)=>{
                    if ( verificacionPassword ) {
                        if(parametros.obtenerToken === 'true'){
                            return res.status(200)
                                .send({ token: jwt.crearToken(usuarioEncontrado) })
                        } else {
                            usuarioEncontrado.password = undefined;
                            return  res.status(200)
                                .send({ usuario: usuarioEncontrado })
                        }

                        
                    } else {
                        return res.status(500)
                            .send({ mensaje: 'Las contrasena no coincide'});
                    }
                })

        } else {
            return res.status(500)
                .send({ mensaje: 'Error, el correo no se encuentra registrado.'})
        }
    })
}

function LoginAdmin(req, res) {
    var parametros = req.body;
    Usuario.findOne({ usuario : parametros.usuario }, (err, usuarioEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if(usuarioEncontrado){
            // COMPARO CONTRASENA SIN ENCRIPTAR CON LA ENCRIPTADA
            bcrypt.compare(parametros.password, usuarioEncontrado.password, 
                (err, verificacionPassword)=>{//TRUE OR FALSE
                    // VERIFICO SI EL PASSWORD COINCIDE EN BASE DE DATOS
                    if ( verificacionPassword ) {
                        // SI EL PARAMETRO OBTENERTOKEN ES TRUE, CREA EL TOKEN
                        if(parametros.obtenerToken === 'true'){
                            return res.status(200)
                                .send({ token: jwt.crearToken(usuarioEncontrado) })
                        } else {
                            usuarioEncontrado.password = undefined;
                            return  res.status(200)
                                .send({ usuario: usuarioEncontrado })
                        }

                        
                    } else {
                        return res.status(500)
                            .send({ mensaje: 'Las contrasena no coincide'});
                    }
                })

        } else {
            return res.status(500)
                .send({ mensaje: 'Error, el correo no se encuentra registrado.'})
        }
    })
}


function editarEmpleado(req, res) {
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

function agregarEmpleadoEmpresa(req, res) {
    var productoId = req.params.idUsuario;
    var parametros = req.body;

    if( parametros.nombreEmpleado && parametros.puesto ) {

        Empresa.findByIdAndUpdate(productoId, { $push: { empleado: { nombreEmpleado: parametros.nombreEmpleado, 
            puesto: parametros.puesto } } }, {new: true}, (err, empleadoAgregado)=>{
                if(err) return res.status(500).send({ mensaje: 'Error en  la peticion'});
                if(!empleadoAgregado) return res.status(500).send({ mensaje: 'Error al agregar el empleado'});

                return res.status(200).send({ producto: empleadoAgregado })

            })

    } else {
        return res.status(500).send({ mensaje: 'Debe enviar los parametros necesarios.' })
    }

}

function obtenerEmpleadoXEmpresa(req, res) {
    var proveedorId = req.params.idUsuario;

    Productos.find({ empleado: { $elemMatch: { _id: proveedorId } } }, (err, empleadoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en  la peticion'});
        if(!empleadoEncontrado) return res.status(500).send({ mensaje: 'Error al buscar el empleado'})

        return res.status(200).send({ empleado: empleadoEncontrado})
    })
}

function obtenerNombreEmpleadoXEmpresa(req, res) {
    var productoId = req.params.idUsuario;
    var parametros = req.body;

    Productos.aggregate([
        {
            $match: { "_id": mongoose.Types.ObjectId(productoId) }
        },
        {
            $unwind: "$nombreEmpleado"
        },
        {
            $match: { "empleado.puesto": { $regex: parametros.puesto, $options: 'i' } }
        }, 
        {
            $match: { "empleado.departamento": { $regex: parametros.departamento, $options: 'i' } }
        }, 
        {
            $group: {
                "_id": "$_id",
                "nombre": { "$first": "$nombre" },
                "empleado": { $push: "$puesto" },
                "empleado": { $push: "$departamento" }
            }
        }
    ]).exec((err, empleadoEncontrado) => {
        return res.status(200).send({ empleado: empleadoEncontrado })
    })
}

module.exports = {
    Login,
    RegistrarAdmin,
    LoginAdmin,
    agregarEmpleado,
    editarEmpleado,
    agregarEmpleadoEmpresa,
    obtenerNombreEmpleadoXEmpresa,
    obtenerEmpleadoXEmpresa
}