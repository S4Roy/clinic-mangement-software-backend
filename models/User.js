const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'employee'],
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    email_verified_at: {
        type: Date,
        required: false,
        default: null
    },
    phone: {
        type: String,
        required: false,
        default: null,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["A", "I", "D"],
        required: true,
        default: "A"
    }
}, { timestamps: true, versionKey: false });

UserSchema.plugin(mongoosePaginate);

const User = mongoose.model(CONFIG.DB.TABLE_USERS, UserSchema);

module.exports = User;