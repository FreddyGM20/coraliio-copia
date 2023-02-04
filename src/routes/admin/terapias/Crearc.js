const userSchema = require('../../../models/usuario')
const citaSchema = require('../../../models/cita')
const { TokenAssign, TokenVerify } = require('../../../middleware/autentication')
const { getTemplate, sendEmail } = require('../../../middleware/email')

module.exports = async function (req, res) {
    const token = req.headers.authorization.split(' ').pop()
    if (token != "null") {
        const tokenver = await TokenVerify(token)
        const paciente = await userSchema.findById(tokenver._id)
        if (paciente.rol == "paciente") {
            const ver = await citaSchema.findOne({ terapeuta: req.body.terapeuta, paciente: req.body.paciente, fecha: req.body.fecha })
            if (ver != null) return res.status(200).send({ response: "Error", message: 'Esta hora esta ocupada' })
            const terapeuta = await userSchema.findById(req.body.terapeuta)
            const cita = new citaSchema({
                terapeuta: terapeuta._id,
                nomt: `${terapeuta.nombre} ${terapeuta.apellido}`,
                paciente: paciente._id,
                nomp: `${paciente.nombre} ${paciente.apellido}`,
                fecha: req.body.fecha
            });
            await cita.save()
            return res.status(200).send({ response: "Success", message: 'Se creo la cita correctamente' })
        } else {
            return res.status(200).send({ response: "Error", message: "Este es un usuario normal" })
        }
    } else {
        return res.status(200).send({ response: "Error", message: "Esta operacion requiere autenticacion" })
    }
}