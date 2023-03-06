const { Validator } = require('node-input-validator');
const Service = require('../../models/Service');

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
                            { "service_name": { $regex: req.body.searchkey, $options: 'i' } }
                        ]
                    }
                };
            }
            else {
                var searchkey = { $match: { "status": { $ne: 'D' } } };
            }
            var aggrigate = Service.aggregate([query, searchkey]);
            var result = await Service.aggregatePaginate(aggrigate, options);
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
                return resp.status(200).send({ status: 'success', data: data, message: "Service list fetched successfully." });
            }
            else {
                return resp.status(200).send({ status: 'error', data: {}, message: "Service not found." });
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
                service_name: 'required|regex:[a-zA-Z][a-zA-Z ]+[a-zA-Z]$',
                duration: 'required|integer',
                fee: 'required|integer'
            });

            const matched = await v.check();
            if (!matched) {
                return resp.status(200).send({ status: 'val_error', message: "Validation Error", errors: v.errors });
            }
            else {
                var result = await Service.findOne({ service_name: { $regex: "^" + req.body.service_name + '$', $options: 'i' }, status: { $ne: 'D' } });
                if (result) {
                    return resp.status(200).send({ status: 'error', data: {}, message: "Service name already exist." });
                }
                else {
                    var data = {
                        service_name: req.body.service_name,
                        duration: req.body.duration,
                        fee: req.body.fee,
                    };
                    result = await Service.create(data);
                    if (result) {
                        return resp.status(200).send({ status: 'success', data: result, message: "Service created successfully." });
                    }
                    else {
                        return resp.status(200).send({ status: 'error', data: {}, message: "Service not created." });
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
                        var result = await Service.findOne({ _id: req.body._id, status: { $ne: 'D' } });
                        if (result) {
                            return resp.status(200).send({ status: 'success', data: result, message: "Service details fetched successfully." });
                        }
                        else {
                            return resp.status(200).send({ status: 'error', data: result, message: "Service not found." });
                        }
                    }
                    catch (error) {
                        return resp.status(200).send({ status: 'error', errors: error, message: "Something went wrong." });
                    }
                }

            }
            else {
                return resp.status(200).send({ status: 'error', message: "Not a valid Service id" });
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
                var result = await Service.findOne({ _id: req.body._id });
                if (result) {
                    const v = new Validator(req.body, {
                        _id: 'required',
                        service_name: 'required|regex:[a-zA-Z][a-zA-Z ]+[a-zA-Z]$',
                        duration: 'required|integer',
                        fee: 'required|integer'
                    });

                    const matched = await v.check();
                    if (!matched) {
                        return resp.status(200).send({ status: 'val_error', message: "Validation Error", errors: v.errors });
                    }
                    else {
                        var result_exist = await Service.findOne({ service_name: req.body.service_name, status: { $ne: 'D' }, _id: { $ne: mongoose.Types.ObjectId(req.body._id) } });
                        if (result_exist) {
                            return resp.status(200).send({ status: 'error', data: {}, message: "Service name already exist." });
                        }
                        else {
                            var update_data = {
                                service_name: req.body.service_name,
                                duration: req.body.duration,
                                fee: req.body.fee,
                            };


                            var result = await Service.updateOne({ _id: mongoose.Types.ObjectId(req.body._id) }, { $set: update_data });
                            if (result) {
                                return resp.status(200).send({ status: 'success', data: result, message: "Service details updated successfully." });
                            }
                            else {
                                return resp.status(200).send({ status: 'error', data: {}, message: "Service details not updated." });
                            }

                        }

                    }
                }
                else {
                    return resp.status(200).send({ status: 'error', data: result, message: "Service not found." });
                }
            }
            else {
                return resp.status(200).send({ status: 'error', message: "Not a valid Service id" });
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
                var result = await Service.findOne({ _id: req.body._id, status: { $ne: 'D' } });
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
                        var result = await Service.updateOne({ _id: mongoose.Types.ObjectId(req.body._id) }, { $set: update_data });
                        if (result) {
                            if (req.body.status == 'D') {
                                var message = "Service deleted successfully.";
                            }
                            else {
                                var message = "Service status updated successfully.";
                            }
                            return resp.status(200).send({ status: 'success', data: result, message: message });
                        }
                        else {
                            return resp.status(200).send({ status: 'error', data: {}, message: "Service status not updated." });
                        }
                    }
                }
                else {
                    return resp.status(200).send({ status: 'error', data: result, message: "Service not found." });
                }
            }
            else {
                return resp.status(200).send({ status: 'error', message: "Not a valid Service id" });
            }
        }
        catch (error) {
            return resp.status(200).send({ status: 'error', errors: error, message: "Something went wrong." });
        }
    },

}