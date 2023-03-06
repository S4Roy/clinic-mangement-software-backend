const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
module.exports = {
    checkAuth: function (req, resp, next) {

        var token = req.headers['x-access-token'];
        if (!token) return resp.status(401).send({ status: 'error', message: 'No token provided.' });
        jwt.verify(token, CONFIG.CONSTANTS.JWT_SECRET, function (err, decoded) {
            if (err) return resp.status(401).send({ status: 'error', message: 'Failed to authenticate token.' });
            req.authData = decoded;
            req.authId = decoded.user_id;
            next();
        });
    },

    authRole(usertype) {
        return function (req, res, next) {
            var token = req.headers['x-access-token'];
            if (!token) return resp.status(401).send({ status: 'error', message: 'No token provided.' });
            jwt.verify(token, CONFIG.CONSTANTS.JWT_SECRET, function (err, decoded) {
                if (err) return resp.status(401).send({ status: 'error', message: 'Failed to authenticate token.' });
                console.log(decoded);
                if (usertype.includes(decoded.role)) {
                    next();
                } else {
                    return res.status(401).send({ status: 'error', message: 'No permission granted' });
                }
            });
        }
    }
}