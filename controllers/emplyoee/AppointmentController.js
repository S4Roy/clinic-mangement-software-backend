const { Validator } = require('node-input-validator');
const Appointment = require('../../models/Appointment');

const niv = require('node-input-validator');
const mongoose = require('mongoose');
const moment_timezone = require('moment-timezone');
const moment = require('moment')

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
            var aggrigate = Appointment.aggregate([query,
                {
                    $lookup: {
                        from: "clients",
                        localField: "client_id",
                        foreignField: "_id",
                        as: "client_data"
                    }
                },
                { $unwind: "$client_data" },
                {
                    $lookup: {
                        from: "services",
                        localField: "service_id",
                        foreignField: "_id",
                        as: "service_data"
                    }
                },
                { $unwind: "$service_data" },
            ]);
            var result = await Appointment.aggregatePaginate(aggrigate, options);
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
                return resp.status(200).send({ status: 'success', data: data, message: "Appointment list fetched successfully." });
            }
            else {
                return resp.status(200).send({ status: 'error', data: {}, message: "Appointment not found." });
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
                schedule_date: 'required|dateFormat:MM-DD-YYYY',
                schedule_time: 'required',
                client_id: 'required|mongoId',
                service_id: 'required|mongoId',
                duration: 'required|integer',
            });

            const matched = await v.check();
            if (!matched) {
                return resp.status(200).send({ status: 'val_error', message: "Validation Error", errors: v.errors });
            }
            else {
                console.log(req.body)
                console.log(req.body.schedule_date)
                let startDate = moment_timezone.tz(moment(req.body.schedule_date + ' ' + req.body.schedule_time, "MM-DD-YYYY hh:mm A"), CONFIG.SERVER.TIME_ZONE)
                let duration = 0;
                if (req.body.duration) {
                    duration = req.body.duration
                }
                console.log(startDate)
                let endDate = moment_timezone.tz(moment(startDate).add(duration, 'minutes'), CONFIG.SERVER.TIME_ZONE)
                console.log(startDate)
                console.log(endDate)
                let appointment_exist = await Appointment.findOne({
                    $and: [
                        { startDate: { $gte: startDate } },
                        { endDate: { $lt: endDate } }
                    ]
                })
                if (appointment_exist) {
                    console.log(appointment_exist)
                }
                else {
                    let new_appointment = {
                        startDate: startDate,
                        endDate: endDate,
                        client_id: req.body.client_id,
                        service_id: req.body.service_id
                    }
                    result = await Appointment.create(new_appointment);
                    if (result) {
                        return resp.status(200).send({ status: 'success', data: result, message: "Appointment created successfully." });
                    }
                    else {
                        return resp.status(200).send({ status: 'error', data: {}, message: "Appointment not created." });
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
                        var result = await Appointment.findOne({ _id: req.body._id, status: { $ne: 'D' } });
                        if (result) {
                            return resp.status(200).send({ status: 'success', data: result, message: "Appointment details fetched successfully." });
                        }
                        else {
                            return resp.status(200).send({ status: 'error', data: result, message: "Appointment not found." });
                        }
                    }
                    catch (error) {
                        return resp.status(200).send({ status: 'error', errors: error, message: "Something went wrong." });
                    }
                }

            }
            else {
                return resp.status(200).send({ status: 'error', message: "Not a valid Appointment id" });
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
                var result = await Appointment.findOne({ _id: req.body._id });
                if (result) {
                    const v = new Validator(req.body, {
                        _id: 'required',
                        Appointment_name: 'required|regex:[a-zA-Z][a-zA-Z ]+[a-zA-Z]$',
                        duration: 'required|integer',
                        fee: 'required|integer'
                    });

                    const matched = await v.check();
                    if (!matched) {
                        return resp.status(200).send({ status: 'val_error', message: "Validation Error", errors: v.errors });
                    }
                    else {
                        var result_exist = await Appointment.findOne({ Appointment_name: req.body.Appointment_name, status: { $ne: 'D' }, _id: { $ne: mongoose.Types.ObjectId(req.body._id) } });
                        if (result_exist) {
                            return resp.status(200).send({ status: 'error', data: {}, message: "Appointment name already exist." });
                        }
                        else {
                            var update_data = {
                                Appointment_name: req.body.Appointment_name,
                                duration: req.body.duration,
                                fee: req.body.fee,
                            };


                            var result = await Appointment.updateOne({ _id: mongoose.Types.ObjectId(req.body._id) }, { $set: update_data });
                            if (result) {
                                return resp.status(200).send({ status: 'success', data: result, message: "Appointment details updated successfully." });
                            }
                            else {
                                return resp.status(200).send({ status: 'error', data: {}, message: "Appointment details not updated." });
                            }

                        }

                    }
                }
                else {
                    return resp.status(200).send({ status: 'error', data: result, message: "Appointment not found." });
                }
            }
            else {
                return resp.status(200).send({ status: 'error', message: "Not a valid Appointment id" });
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
                var result = await Appointment.findOne({ _id: req.body._id, status: { $ne: 'D' } });
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
                        var result = await Appointment.updateOne({ _id: mongoose.Types.ObjectId(req.body._id) }, { $set: update_data });
                        if (result) {
                            if (req.body.status == 'D') {
                                var message = "Appointment deleted successfully.";
                            }
                            else {
                                var message = "Appointment status updated successfully.";
                            }
                            return resp.status(200).send({ status: 'success', data: result, message: message });
                        }
                        else {
                            return resp.status(200).send({ status: 'error', data: {}, message: "Appointment status not updated." });
                        }
                    }
                }
                else {
                    return resp.status(200).send({ status: 'error', data: result, message: "Appointment not found." });
                }
            }
            else {
                return resp.status(200).send({ status: 'error', message: "Not a valid Appointment id" });
            }
        }
        catch (error) {
            return resp.status(200).send({ status: 'error', errors: error, message: "Something went wrong." });
        }
    },

}