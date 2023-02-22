const userSchema = require('../../models/usuario')
const citaSchema = require('../../models/cita')
const { TokenVerify } = require('../../middleware/autentication')
const { addHours } = require('../../middleware/addhours')

module.exports = async function (req, res) {
    const token = req.headers.authorization.split(' ').pop()
    if (token != "null") {
        const tokenver = await TokenVerify(token)
        const paciente = await userSchema.findById(tokenver._id)
        if (paciente.rol == "paciente") {
            const ver = await citaSchema.findOne({ terapeuta: req.body.terapeuta, paciente: req.body.paciente, fecha: req.body.fecha })
            if (ver != null) return res.status(200).send({ response: "Error", message: 'Esta fecha esta ocupada' })
            const hora = req.body.fechai.substring(11,16)
            const disponible = await userSchema.find({ $and: [{ horai: { $lte: hora} }, { horaf: { $gte: hora } }, { rol: "terapeuta" }, { _id: req.body.terapeuta }] })
            if (disponible.length == 0) return res.status(200).send({ response: "Error", message: 'El terapeuta seleccionado no esta disponible en la hora seleccionada' })
            const terapeuta = await userSchema.findById(req.body.terapeuta)
            const date = new Date(req.body.fechai)
            const fechaf = addHours(date, 2)
            const cita = new citaSchema({
                terapeuta: terapeuta._id,
                nomt: `${terapeuta.nombre} ${terapeuta.apellido}`,
                paciente: paciente._id,
                nomp: `${paciente.nombre} ${paciente.apellido}`,
                numta:0,
                numtf: req.body.numtf,
                fechai: req.body.fechai,
                fechaf: fechaf
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