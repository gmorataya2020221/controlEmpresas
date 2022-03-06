const express = require('express');
const controladorEmpresa = require('../controllers/empresa.controller');

// MIDDLEWARES
const md_autenticacion = require('../middlewares/autenticacion');
const md_roles = require('../middlewares/roles');

const api = express.Router();

api.post('/agregarEmpresa', [md_autenticacion.Auth, md_roles.verAdmin], controladorEmpresa.agregarEmpresa);
api.put('/editarEmpresa/:idEmpresa', [md_autenticacion.Auth, md_roles.verAdmin], controladorEmpresa.editarEmpresa)
api.delete('/eliminarEmpresa/:idEmpresa', [md_autenticacion.Auth, md_roles.verAdmin], controladorEmpresa.eliminarEmpresaADefault);

module.exports = api;