const { Validator } = require('node-input-validator');
const { sendMail } = require('../../helpers/email_helper');
const User = require('../../models/User');
const bcrypt = require('bcrypt');
//const saltRounds = CONFIG.CONSTANTS.BCRYPT_SALT_ROUNDS;

const niv = require('node-input-validator');
const mongoose = require('mongoose');

niv.extend('unique', async({ value, args }) => {
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
    list: async function(req, resp, next) {
        var result = {};
        try
        {
            var page = 1;
            var limit = CONFIG.CONSTANTS.PER_PAGE;
            var draw = '';
            if(req.body.page)
            {
                page = req.body.page;
            }
            if(req.body.limit)
            {
                limit = req.body.limit;
            }
            if(req.body.draw)
            {
                draw = req.body.draw;
            }
            var query   = {};
            var options = {
                sort:     { name: 1 },
                page:   page, 
                limit:    limit
            };
            var result = await User.paginate(query, options);
            var sl_no = (parseInt(options.page) - 1) * options.limit;
            data = result;
            data.draw = draw;
            docs = data.docs.map((item) => {
              sl_no += 1;
              item.sl_no = sl_no;
    
              return item;
            });
            data.docs = docs;
            if(data)
            {
                return resp.status(200).send({ status: 'success', data:data, message: "employee list fetched successfully."});
            }
            else
            {
                return resp.status(200).send({ status: 'error',data:{}, message: "employee not found."});
            }
        }
        catch(error)
        {
            return resp.status(200).send({ status: 'error',errors:error, message: "Something went wrong."});
        }
    },
    add: async function(req, resp, next) {
        try
        {
            const v = new Validator(req.body, {
                first_name: 'required|regex:[a-zA-Z][a-zA-Z ]+[a-zA-Z]$',
                last_name: 'required|regex:[a-zA-Z][a-zA-Z ]+[a-zA-Z]$',
                phone: 'phoneNumber|minLength:10|maxLength:12|unique:'+CONFIG.DB.TABLE_USERS+',phone',
                email: 'required|email|unique:'+CONFIG.DB.TABLE_USERS+',email',
                password: 'required|length:20,8|same:password_confirmation',
                password_confirmation: 'required|length:20,8',
                role: 'required',
            });

            const matched = await v.check();
            if (!matched) {
                return resp.status(200).send({ status: 'val_error', message: "Validation Error", errors: v.errors });
            } else {
                var registerdocument = {
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email: req.body.email,
                    email_verified_at:  Date.now(),
                    phone: req.body.phone ? req.body.phone : null,
                    password: bcrypt.hashSync(req.body.password, CONFIG.CONSTANTS.BCRYPT_SALT_ROUNDS),
                    role: req.body.role,
                };

                User.create(registerdocument, async function(err, verification) {
                    if (err) return resp.status(200).send({ status: 'error', message: err.message });

                    const send_email = await sendMail({
                        to: registerdocument.email,
                        subject: "XYZ CLINIC - NEW ACCOUNT ",
                        type: "register-account",
                        data: {
                            user_name: registerdocument.first_name,
                            email: req.body.email,
                            password: req.body.password
                        }
                    })
                    console.log(send_email);
                    return resp.status(200).send({ status: 'success', message: "Account has been created and credentials been sent to the email address."});
                })

            }
        }
        catch(error)
        {
            return resp.status(200).send({ status: 'error',errors:error, message: "Something went wrong."});
        }
    },
    details: async function(req, resp, next) {
        var user_details = {};
        try
        {
            var ObjectId = require('mongoose').Types.ObjectId;
            if(ObjectId.isValid(req.body.id))
            {
                const v = new Validator(req.body, {
                    id: 'required'
                });

                const matched = await v.check();
                if (!matched) {
                    return resp.status(200).send({ status: 'val_error', message: "Validation Error", errors: v.errors });
                } else {
                    try
                    {
                        var user_details = await User.findOne({ _id: req.body.id , status: { $ne: 'D' } , role: { $ne: 'admin' }});
                        if(user_details)
                        {
                            return resp.status(200).send({ status: 'success', data:user_details, message: "employee details fetched successfully."});
                        }
                        else
                        {
                            return resp.status(200).send({ status: 'error',data:user_details, message: "employee not found."});
                        }
                    }
                    catch(error)
                    {
                        return resp.status(200).send({ status: 'error',errors:error, message: "Something went wrong."});
                    }
                }

            }
            else
            {
                return resp.status(200).send({ status: 'error', message: "Not a valid employee id"});
            }

        }
        catch(error)
        {
            return resp.status(200).send({ status: 'error',errors:error, message: "Something went wrong."});
        }
    },
    update: async function(req, resp, next) {
        try
        {
            var tournament_details = {};
            var ObjectId = require('mongoose').Types.ObjectId;
            if(ObjectId.isValid(req.body.id))
            {
                var user_details = await User.findOne({ _id: req.body.id});
                if(user_details)
                {
                    const v = new Validator(req.body, {
                        id: 'required',
                        first_name: 'required|regex:[a-zA-Z][a-zA-Z ]+[a-zA-Z]$',
                        last_name: 'required|regex:[a-zA-Z][a-zA-Z ]+[a-zA-Z]$',
                        phone: 'phoneNumber|minLength:10|maxLength:12|unique:'+CONFIG.DB.TABLE_USERS+',phone,'+req.body.id,
                        email: 'required|email|unique:'+CONFIG.DB.TABLE_USERS+',email,'+req.body.id,
                        password: 'nullable|length:20,8|same:password_confirmation',
                        password_confirmation: 'nullable|length:20,8'
                    });

                    const matched = await v.check();
                    if (!matched) 
                    {
                        return resp.status(200).send({ status: 'val_error', message: "Validation Error", errors: v.errors });
                    } 
                    else 
                    {
                        var update_data = {
                            first_name: req.body.first_name,
                            last_name: req.body.last_name,
                            email: req.body.email,
                            phone: req.body.phone ? req.body.phone : null,
                            password: bcrypt.hashSync(req.body.password, CONFIG.CONSTANTS.BCRYPT_SALT_ROUNDS),
                        };


                        var result = await User.updateOne({ _id:mongoose.Types.ObjectId(req.body.id)}, {$set:update_data});
                        if(result)
                        {
                            return resp.status(200).send({ status: 'success', data:result, message: "employee details updated successfully."});
                        }
                        else
                        {
                            return resp.status(200).send({ status: 'error', data:{}, message: "employee details not updated."});
                        }
                    }
                }
                else
                {
                    return resp.status(200).send({ status: 'error',data:user_details, message: "employee not found."});
                }
            }
            else
            {
                return resp.status(200).send({ status: 'error', message: "Not a valid employee id"});
            }
        }
        catch(error)
        {
            return resp.status(200).send({ status: 'error',errors:error, message: "Something went wrong."});
        }
    },
    statuschange: async function(req, resp, next) {
        try
        {
            var user_details = {};
            var ObjectId = require('mongoose').Types.ObjectId;
            if(ObjectId.isValid(req.body.id))
            {
                var user_details = await User.findOne({ _id: req.body.id , status: { $ne: 'D' } , role: { $ne: 'admin'}});
                if(user_details)
                {
                    const v = new Validator(req.body, {
                        id: 'required',
                        status: 'required|in:A,I,D'
                    });

                    const matched = await v.check();
                    if (!matched) 
                    {
                        return resp.status(200).send({ status: 'val_error', message: "Validation Error", errors: v.errors });
                    } 
                    else 
                    {
                        var update_data = {
                            status: req.body.status,
                        };
                        var result = await User.updateOne({ _id:mongoose.Types.ObjectId(req.body.id)}, {$set:update_data});
                        if(result)
                        {
                            if(req.body.status == 'D')
                            {
                                var message = "employee deleted successfully.";
                            }
                            else{
                                var message = "employee status updated successfully.";
                            }
                            return resp.status(200).send({ status: 'success', data:result, message:message });
                        }
                        else
                        {
                            return resp.status(200).send({ status: 'error', data:{}, message: "employee status not updated."});
                        }
                    }
                }
                else
                {
                    return resp.status(200).send({ status: 'error',data:{}, message: "employee not found."});
                }
            }
            else
            {
                return resp.status(200).send({ status: 'error', message: "Not a valid employee id"});
            }
        }
        catch(error)
        {
            return resp.status(200).send({ status: 'error',errors:error, message: "Something went wrong."});
        }
    },
    changePassword: async function(req, resp, next) {
        try
        {
            var user_details = await User.findOne({ id: mongoose.Types.ObjectId(req.authData.user_id),role:'admin'});
            if(user_details){
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
                    var user_result = await User.updateOne({ _id:mongoose.Types.ObjectId(req.authData.user_id)}, {$set:changepasswordocument});
                    return resp.status(200).send({ status: 'success', data:user_result, message: "Password updated successfully."});
                }
            }
            else
            {
                return resp.status(200).send({ status: 'error',data:company_details, message: "Company not found."});
            }

        }
        catch(error)
        {
            return resp.status(200).send({ status: 'error',errors:error, message: "Something went wrong."});
        }
    },
    adminDetails: async function(req, resp, next) {
        var result = {};
        try
        {
            var result = await User.findOne({ _id: req.authId});
            // var result = await employee.aggregatePaginate(aggrigate, options);
            if(result)
            {
                return resp.status(200).send({ status: 'success', data:result, message: "Details fetched successfully."});
            }
            else
            {
                return resp.status(200).send({ status: 'error',data:result, message: "Admin not found."});
            }
        }
        catch(error)
        {
            return resp.status(200).send({ status: 'error',errors:error, message: "Something went wrong."});
        }
    },
    adminUpdate: async function(req, resp, next) {
        try
        {
            var result = {};
            var ObjectId = require('mongoose').Types.ObjectId;
            if(ObjectId.isValid(req.authId))
            {
                var details = await User.findOne({ _id: req.authId});
                if(details)
                {
                    const v = new Validator(req.body, {
                        first_name  : 'required|regex:[a-zA-Z][a-zA-Z ]+[a-zA-Z]$',
                        last_name   : 'required|regex:[a-zA-Z][a-zA-Z ]+[a-zA-Z]$',
                        phone       : 'phoneNumber|minLength:10|maxLength:12|unique:'+CONFIG.DB.TABLE_USERS+',phone,'+req.authId,
                        email       : 'required|email|unique:'+CONFIG.DB.TABLE_USERS+',email,'+req.authId
                        
                    });

                    const matched = await v.check();
                    if (!matched) 
                    {
                        return resp.status(200).send({ status: 'val_error', message: "Validation Error", errors: v.errors });
                    } 
                    else 
                    {
                        var update_data = {
                            first_name  : req.body.first_name,
                            last_name   : req.body.last_name,
                            email       : req.body.email,
                            phone       : req.body.phone ? req.body.phone : null
                        };
                        var result = await User.updateOne({ _id:mongoose.Types.ObjectId(req.authId)}, {$set:update_data});
                        if(result)
                        {
                            return resp.status(200).send({ status: 'success', data:result, message: "Details updated successfully."});
                        }
                        else
                        {
                            return resp.status(200).send({ status: 'error', data:{}, message: "Details not updated."});
                        }
                    }
                }
                else
                {
                    return resp.status(200).send({ status: 'error',data:user_details, message: "User not found."});
                }
            }
            else
            {
                return resp.status(200).send({ status: 'error', message: "Not a valid employee id"});
            }
        }
        catch(error)
        {
            return resp.status(200).send({ status: 'error',errors:error, message: "Something went wrong."});
        }
    },
    adminChangePassword: async function(req, resp, next) {
        try
        {
            const v = new Validator(req.body, {
                old_password: 'required',
                password: 'required|length:20,8|same:password_confirmation',
                password_confirmation: 'required|length:20,8',
            });
            const matched = await v.check();
            if (!matched) 
            {
                return resp.status(200).send({ status: 'val_error', message: "Validation Error", errors: v.errors });
            } 
            else 
            {
                var user_details = await User.findOne({ _id: req.authId });
                var check_password = bcrypt.compareSync(req.body.old_password, user_details.password);
                if(check_password)
                {
                    var changepasswordocument = {
                        password: bcrypt.hashSync(req.body.password, CONFIG.CONSTANTS.BCRYPT_SALT_ROUNDS),
                    };
                    var user_result = await User.updateOne({ _id:mongoose.Types.ObjectId(req.authId)}, {$set:changepasswordocument});
                    return resp.status(200).send({ status: 'success', data:user_result, message: "Password updated successfully."});

                }
                else
                {
                    return resp.status(200).send({ status: 'error',data:{}, message: "Old password not match."});
                }
                
            }
        }
        catch(error)
        {
            return resp.status(200).send({ status: 'error',errors:error, message: "Something went wrong."});
        }
    },
}