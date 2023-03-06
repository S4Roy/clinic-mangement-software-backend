const mongoose = require('mongoose');
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const ServiceSchema = new mongoose.Schema({
    service_name: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    fee: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["A", "I", "D"],
        required: true,
        default: "A"
    }
}, { timestamps: true, versionKey: false });

ServiceSchema.plugin(aggregatePaginate);

const Service = mongoose.model(CONFIG.DB.TABLE_SERVICES, ServiceSchema);

module.exports = Service;