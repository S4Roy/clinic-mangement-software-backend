const { Validator } = require('node-input-validator');
const { sendMail } = require('../../helpers/email_helper');
const employee = require('../../models/User');
const bcrypt = require('bcrypt');
const emailHelper = require('../../helpers/email_helper');
//const saltRounds = CONFIG.CONSTANTS.BCRYPT_SALT_ROUNDS;

const niv = require('node-input-validator');
const mongoose = require('mongoose');

niv.extend('unique', async ({ value, args }) => {
    // default field is email in this example
    const filed = args[1] || 'email';

    let condition = {};

    condition[filed] = value;

    // add ignore condition
    if (args[2]) {
        condition['_id'] = { $ne: mongoose.Types.ObjectId(args[2]) };
    }

    let emailExist = await mongoose.model(args[0]).findOne(condition).select(filed);

    // email already exists
    if (emailExist) {
        return false;
    }

    return true;
});

module.exports = {
    details: async function (req, resp, next) {
        var result = {};
        try {
            var ObjectId = require('mongoose').Types.ObjectId;
            if (ObjectId.isValid(req.body._id)) {
                const v = new Validator(req.body, {
                    _id: 'required'
                });
                const matched = await v.check();
                if (!matched) {
                    return resp.status(200).send({ status: 'val_error', message: "Validation Error", errors: v.errors });
                } else {
                    try {
                        var options = {};
                        var condition = { $match: { status: { $ne: 'D' }, _id: { $eq: mongoose.Types.ObjectId(req.body._id) } } };
                        var result = await employee.aggregate([
                            condition,
                            {
                                "$project": {
                                    "first_name": 1,
                                    "last_name": 1,
                                    "email": 1,
                                    "phone": 1,
                                    "status": 1,
                                }
                            }
                        ]);
                        if (result) {
                            return resp.status(200).send({ status: 'success', data: result, message: "employee details fetched successfully." });
                        }
                        else {
                            return resp.status(200).send({ status: 'error', data: result, message: "employee not found." });
                        }
                    }
                    catch (error) {
                        return resp.status(200).send({ status: 'error', errors: error, message: "Something went wrong." });
                    }
                }
            }
            else {
                return resp.status(200).send({ status: 'error', message: "Not a valid employee id" });
            }

        }
        catch (error) {
            return resp.status(200).send({ status: 'error', errors: error, message: "Something went wrong." });
        }
    },
    update: async function (req, resp, next) {
        try {
            var result = {};
            var ObjectId = require('mongoose').Types.ObjectId;
            if (ObjectId.isValid(req.body._id)) {
                var details = await employee.findOne({ _id: req.body._id });
                if (details) {
                    const v = new Validator(req.body, {
                        _id: 'required',
                        first_name: 'required|regex:[a-zA-Z][a-zA-Z ]+[a-zA-Z]$',
                        last_name: 'required|regex:[a-zA-Z][a-zA-Z ]+[a-zA-Z]$',
                        phone: 'phoneNumber|minLength:10|maxLength:12|unique:' + CONFIG.DB.TABLE_EMPLOYEE + ',phone,' + req.body._id,
                        email: 'required|email|unique:' + CONFIG.DB.TABLE_EMPLOYEE + ',email,' + req.body._id,
                    });

                    const matched = await v.check();
                    if (!matched) {
                        return resp.status(200).send({ status: 'val_error', message: "Validation Error", errors: v.errors });
                    }
                    else {
                        var update_data = {
                            first_name: req.body.first_name,
                            last_name: req.body.last_name,
                            email: req.body.email,
                            phone: req.body.phone ? req.body.phone : null
                        };
                        var result = await employee.updateOne({ _id: mongoose.Types.ObjectId(req.body._id) }, { $set: update_data });
                        if (result) {
                            return resp.status(200).send({ status: 'success', data: result, message: "employee details updated successfully." });
                        }
                        else {
                            return resp.status(200).send({ status: 'error', data: {}, message: "employee details not updated." });
                        }
                    }
                }
                else {
                    return resp.status(200).send({ status: 'error', data: user_details, message: "employee not found." });
                }
            }
            else {
                return resp.status(200).send({ status: 'error', message: "Not a valid employee id" });
            }
        }
        catch (error) {
            return resp.status(200).send({ status: 'error', errors: error, message: "Something went wrong." });
        }
    },
    changePassword: async function (req, resp, next) {
        try {
            var user_details = await employee.findOne({ id: mongoose.Types.ObjectId(req.authData.user_id), role: 'admin' });
            if (user_details) {
                const v = new Validator(req.body, {
                    password: 'required|length:20,8|same:password_confirmation',
                    password_confirmation: 'required|length:20,8',
                });

                const matched = await v.check();
                if (!matched) {
                    return resp.status(200).send({ status: 'val_error', message: "Validation Error", errors: v.errors });
                } else {
                    var changepasswordocument = {
                        password: bcrypt.hashSync(req.body.password, CONFIG.CONSTANTS.BCRYPT_SALT_ROUNDS),
                    };
                    var user_result = await employee.updateOne({ _id: mongoose.Types.ObjectId(req.authData.user_id) }, { $set: changepasswordocument });
                    return resp.status(200).send({ status: 'success', data: user_result, message: "Password updated successfully." });
                }
            }
            else {
                return resp.status(200).send({ status: 'error', data: company_details, message: "Company not found." });
            }

        }
        catch (error) {
            return resp.status(200).send({ status: 'error', errors: error, message: "Something went wrong." });
        }
    },
}