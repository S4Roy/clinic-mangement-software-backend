const mongoose = require('mongoose');
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const AppointmentSchema = new mongoose.Schema({
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    client_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "clients"
    },
    service_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "clients"
    },

    // service_list: [{
    //     type: Schema.Types.ObjectId,
    //     required: true,
    //     ref: "services"
    // }],
    status: {
        type: String,
        enum: ["A", "I", "D"],
        required: true,
        default: "A"
    }
}, { timestamps: true, versionKey: false });

AppointmentSchema.plugin(aggregatePaginate);

const Appointment = mongoose.model(CONFIG.DB.TABLE_APPOINTMENTS, AppointmentSchema);

module.exports = Appointment;