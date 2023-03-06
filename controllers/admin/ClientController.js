const { Validator } = require('node-input-validator');
const Client = require('../../models/Client');

const niv = require('node-input-validator');
const mongoose = require('mongoose');


module.exports = {
    list: async function (req, resp, next) {
        var result = {};
        try {
            var page = 1;
            var limit = CONFIG.CONSTANTS.PER_PAGE;
            var draw = '';
            if (req.body.page) {
                page = req.body.page;
            }
            if (req.body.limit) {
                limit = req.body.limit;
            }
            if (req.body.draw) {
                draw = req.body.draw;
            }
            var query = {
                $match: { status: { $ne: 'D' } },
            };
            var options = {
                sort: { _id: 1 },
                page: page,
                limit: limit
            };
            if (req.body.searchkey) {
                var searchkey = {
                    $match: {
                        $or: [
                            { "first_name": { $regex: req.body.searchkey, $options: 'i' } }
                        ]
                    }
                };
            }
            else {
                var searchkey = { $match: { "status": { $ne: 'D' } } };
            }
            var aggrigate = Client.aggregate([query, searchkey]);
            var result = await Client.aggregatePaginate(aggrigate, options);
            var sl_no = (parseInt(options.page) - 1) * options.limit;
            data = result;
            data.draw = draw;
            docs = data.docs.map((item) => {
                sl_no += 1;
                item.sl_no = sl_no;

                return item;
            });
            data.docs = docs;
            if (data) {
                return resp.status(200).send({ status: 'success', data: data, message: "Client list fetched successfully." });
            }
            else {
                return resp.status(200).send({ status: 'error', data: {}, message: "Client not found." });
            }
        }
        catch (error) {
            return resp.status(200).send({ status: 'error', errors: error, message: "Something went wrong." });
        }
    },
    add: async function (req, resp, next) {
        try {
            var result = {};
            const v = new Validator(req.body, {
                first_name: 'required|regex:[a-zA-Z][a-zA-Z ]+[a-zA-Z]$',
                last_name: 'required|regex:[a-zA-Z][a-zA-Z ]+[a-zA-Z]$',
                email: 'required|unique:' + CONFIG.DB.TABLE_CLIENTS + ',email',
                phone: 'phoneNumber|minLength:10|maxLength:12|unique:' + CONFIG.DB.TABLE_CLIENTS + ',phone'
            });

            const matched = await v.check();
            if (!matched) {
                return resp.status(200).send({ status: 'val_error', message: "Validation Error", errors: v.errors });
            }
            else {
                var result = await Client.findOne({ email: { $regex: "^" + req.body.email + '$', $options: 'i' }, status: { $ne: 'D' } });
                if (result) {
                    return resp.status(200).send({ status: 'error', data: {}, message: "Client email already exist." });
                }
                else {
                    var data = {
                        first_name: req.body.first_name,
                        last_name: req.body.last_name,
                        email: req.body.email,
                        phone: req.body.phone
                    };
                    result = await Client.create(data);
                    if (result) {
                        return resp.status(200).send({ status: 'success', data: result, message: "Client created successfully." });
                    }
                    else {
                        return resp.status(200).send({ status: 'error', data: {}, message: "Client not created." });
                    }
                }


            }
        }
        catch (error) {
            return resp.status(200).send({ status: 'error', errors: error, message: "Something went wrong." });
        }
    },
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
                        var result = await Client.findOne({ _id: req.body._id, status: { $ne: 'D' } });
                        if (result) {
                            return resp.status(200).send({ status: 'success', data: result, message: "Client details fetched successfully." });
                        }
                        else {
                            return resp.status(200).send({ status: 'error', data: result, message: "Client not found." });
                        }
                    }
                    catch (error) {
                        return resp.status(200).send({ status: 'error', errors: error, message: "Something went wrong." });
                    }
                }

            }
            else {
                return resp.status(200).send({ status: 'error', message: "Not a valid Client id" });
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
                var result = await Client.findOne({ _id: req.body._id });
                if (result) {
                    const v = new Validator(req.body, {
                        _id: 'required',
                        first_name: 'required|regex:[a-zA-Z][a-zA-Z ]+[a-zA-Z]$',
                        last_name: 'required|regex:[a-zA-Z][a-zA-Z ]+[a-zA-Z]$',
                        email: 'required|email',
                        phone: 'phoneNumber|minLength:10|maxLength:12'
                    });

                    const matched = await v.check();
                    if (!matched) {
                        return resp.status(200).send({ status: 'val_error', message: "Validation Error", errors: v.errors });
                    }
                    else {
                        var result_exist = await Client.findOne({ email: req.body.email, status: { $ne: 'D' }, _id: { $ne: mongoose.Types.ObjectId(req.body._id) } });
                        if (result_exist) {
                            return resp.status(200).send({ status: 'error', data: {}, message: "Client email already exist." });
                        }
                        else {
                            var update_data = {
                                first_name: req.body.first_name,
                                last_name: req.body.last_name,
                                email: req.body.email,
                                phone: req.body.phone
                            };


                            var result = await Client.updateOne({ _id: mongoose.Types.ObjectId(req.body._id) }, { $set: update_data });
                            if (result) {
                                return resp.status(200).send({ status: 'success', data: result, message: "Client details updated successfully." });
                            }
                            else {
                                return resp.status(200).send({ status: 'error', data: {}, message: "Client details not updated." });
                            }

                        }

                    }
                }
                else {
                    return resp.status(200).send({ status: 'error', data: result, message: "Client not found." });
                }
            }
            else {
                return resp.status(200).send({ status: 'error', message: "Not a valid Client id" });
            }
        }
        catch (error) {
            return resp.status(200).send({ status: 'error', errors: error, message: "Something went wrong." });
        }
    },
    statuschange: async function (req, resp, next) {
        try {
            var result = {};
            var ObjectId = require('mongoose').Types.ObjectId;
            if (ObjectId.isValid(req.body._id)) {
                var result = await Client.findOne({ _id: req.body._id, status: { $ne: 'D' } });
                if (result) {
                    const v = new Validator(req.body, {
                        _id: 'required',
                        status: 'required|in:A,I,D'
                    });

                    const matched = await v.check();
                    if (!matched) {
                        return resp.status(200).send({ status: 'val_error', message: "Validation Error", errors: v.errors });
                    }
                    else {
                        var update_data = {
                            status: req.body.status,
                        };
                        var result = await Client.updateOne({ _id: mongoose.Types.ObjectId(req.body._id) }, { $set: update_data });
                        if (result) {
                            if (req.body.status == 'D') {
                                var message = "Client deleted successfully.";
                            }
                            else {
                                var message = "Client status updated successfully.";
                            }
                            return resp.status(200).send({ status: 'success', data: result, message: message });
                        }
                        else {
                            return resp.status(200).send({ status: 'error', data: {}, message: "Client status not updated." });
                        }
                    }
                }
                else {
                    return resp.status(200).send({ status: 'error', data: result, message: "Client not found." });
                }
            }
            else {
                return resp.status(200).send({ status: 'error', message: "Not a valid Client id" });
            }
        }
        catch (error) {
            return resp.status(200).send({ status: 'error', errors: error, message: "Something went wrong." });
        }
    },

}