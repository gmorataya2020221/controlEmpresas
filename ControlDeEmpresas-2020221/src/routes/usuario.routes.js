const express = require('express');
const usuarioControlador = require('../controllers/usuario.controller');
const md_autenticacion = require('../middlewares/autenticacion');
const md_roles = require('../middlewares/roles');

const api = express.Router();

api.post('/login', usuarioControlador.Login);
api.post('/loginAdmin', usuarioControlador.LoginAdmin);
api.put('/editarUsuario/:idUsuario', md_autenticacion.Auth, usuarioControlador.editarEmpleado);
api.get('/agregarEmpleado',[md_autenticacion.Auth, md_roles.verEmpresa], usuarioControlador.agregarEmpleado)
api.put('/agregarEmpleadoEmpresa/:idEmpleado', usuarioControlador.agregarEmpleadoEmpresa);
api.get('/obtenerEmpleadoXEmpresa/:idEmpleado', usuarioControlador.obtenerEmpleadoXEmpresa)
api.get('/obtenerNombreEmpleadoXEmpresa/:idEmpleado', usuarioControlador.obtenerNombreEmpleadoXEmpresa)

module.exports = api;