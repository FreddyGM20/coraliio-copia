const userSchema = require('../../models/usuario')
const { TokenVerify } = require('../../middleware/autentication')
const { getTemplate, sendEmail } = require('../../middleware/email')
const fs = require('fs').promises

module.exports = async function (req, res) {
    if (req.headers.authorization == null || req.headers.authorization == undefined) return res.status(200).send({ response: "Error", message: "No existe Autorizacion" })
    const token = req.headers.authorization.split(' ').pop()
    if (token != "null") {
        const tokenver = await TokenVerify(token)
        const admin = await userSchema.findById(tokenver._id)
        if (admin.rol == "admin") {
            const user = await userSchema.findById(req.params.id)
            await userSchema.updateOne({ _id: user._id }, {
                $set: {
                    isActive: !user.isActive
                }
            })
            const template = getTemplate(user.nombre, user.apellido, process.env.URLF, 1);
            const resp = await sendEmail(user.email, template, 1);
            if (resp == false) return res.status(200).send({ response: "Error", message: "Error al enviar el email" })
            return res.status(200).send({ response: "Success", message: "Estado cambiado correctamente" })
        } else {
            return res.status(200).send({ response: "Error", message: "Este es un usuario normal" })
        }
    } else {
        return res.status(200).send({ response: "Error", message: "Esta operacion requiere autenticacion" })
    }
}
