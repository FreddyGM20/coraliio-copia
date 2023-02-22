const userSchema = require('../../../models/usuario')
const { TokenVerify } = require('../../../middleware/autentication')
const fs = require('fs').promises

module.exports = async function (req, res) {
  const token = req.headers.authorization.split(' ').pop()
  if (token != "null") {
    const tokenver = await TokenVerify(token)
    const admin = await userSchema.findById(tokenver._id)
    if (admin.rol == "admin") {
      const user = await userSchema.findById(req.params.id)
      if (user.rol != "terapeuta") return res.status(200).send({ response: "Error", message: "Este usuario no es terapeuta" })
      if (user.email != req.body.email) {
        const ver = await userSchema.findOne({ email: req.body.email })
        if (ver != null) return res.status(200).send({ response: "Error", message: "Este email ya existe" })
      }
      const especialidad = req.body.especialidad.split(", "||",")
      await userSchema.updateOne({ _id: user._id }, {
        $set: {
          nombre: req.body.nombre,
          apellido: req.body.apellido,
          email: req.body.email,
          telefono: req.body.telefono,
          identificacion: req.body.identifacion,
          tarjetap: req.body.tarjetap,
          especialidad: especialidad,
          descripcion: req.body.descripcion,
          añose: req.body.añose,
          horai: req.body.horai,
          horaf: req.body.horaf,
          valorh: req.body.valorh
        }
      })
      return res.status(200).send({ response: "Success", message: "Cambios guardados correctamente" })
    } else {
      return res.status(200).send({ response: "Error", message: "Este es un usuario normal" })
    }

  } else {
    return res.status(200).send({ response: "Error", message: "Esta operacion requiere autenticacion" })
  }
}
