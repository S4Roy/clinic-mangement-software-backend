const mongoose = require('mongoose');
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const ClientSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: false,
        default: null,
        unique: true
    },
    status: {
        type: String,
        enum: ["A", "I", "D"],
        required: true,
        default: "A"
    }
}, { timestamps: true, versionKey: false });

ClientSchema.plugin(aggregatePaginate);

const Client = mongoose.model(CONFIG.DB.TABLE_CLIENTS, ClientSchema);

module.exports = Client;