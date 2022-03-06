
exports.verAdmin = function(req, res, next) {
    if(req.user.rol !== "ROL_ADMIN") return res.status(403).send({mensaje: "Solo puede acceder el admin"})
    
    next();
}

exports.verEmpresa = function(req, res, next) {
    if(req.user.rol !== "ROL_EMPRESA") return res.status(403).send({mensaje: "Solo puede acceder la empresa"})
    
    next();
}