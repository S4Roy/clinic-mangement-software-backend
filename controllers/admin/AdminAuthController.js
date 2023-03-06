const { Validator } = require('node-input-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

module.exports = {
    login: async function(req, resp, next) {
        const v = new Validator(req.body, {
            email: 'required|email',
            password: 'required',
        });
        const matched = await v.check();
        if (!matched) {
            return resp.status(200).send({ status: 'val_error', message: "Validation Error", errors: v.errors });
        } else {
            User.findOne({ email: req.body.email, role: "admin" }, '', function(err, admin) {
                if (err) {
                    resp.json({ status: 'error', message: 'No Data Found' });
                } else {
                    if (!admin) {
                        return resp.status(200).json({ status: 'error', message: 'The email you entered is invalid' });
                    }

                    if (admin.status != "A") {
                        return resp.status(200).json({ status: 'error', message: 'Your account has been blocked' });
                    }

                    var chkval = bcrypt.compareSync(req.body.password, admin.password);
                    if (chkval) {
                        const options = { expiresIn: '365d' };
                        const tokendata = { user_id: admin._id, user_email: admin.email, role: admin.role }
                        const token = jwt.sign(tokendata, CONFIG.CONSTANTS.JWT_SECRET, options);

                        resp.status(200).json({ status: 'success', admin: admin, token: token, message: 'Logged in successfully.' });
                    } else {
                        resp.status(200).json({ status: 'error', message: 'The password you entered is invalid' });
                    }
                }
            })
        }
    },

    auth_check: async function(req, resp, next) {
        var token = req.headers['x-access-token'];
        if (!token) return resp.status(200).send({ status: 'error', message: 'No token provided.' });
        jwt.verify(token, CONFIG.CONSTANTS.JWT_SECRET, function(err, decoded) {
            if (err) return resp.status(200).send({ status: 'error', message: 'Failed to authenticate token.' });

            resp.status(200).send(decoded);
        });
    },
}