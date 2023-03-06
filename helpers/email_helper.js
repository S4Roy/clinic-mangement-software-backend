const nodemailer = require("nodemailer");
var handlebars = require('handlebars');
var fs = require('fs');
var moment = require('moment');
var puppeteer = require('puppeteer');
require('../config/config');
module.exports = {
    sendMail: async function (maildata) {
        try {
            let transporter = nodemailer.createTransport({
                host: CONFIG.EMAIL.SMTP_HOST,
                port: CONFIG.EMAIL.SMTP_PORT,
                secure: true,
                auth: {
                    user: CONFIG.EMAIL.SMTP_USER,
                    pass: CONFIG.EMAIL.SMTP_PASSWORD
                }
            });

            var send_mail_document = {
                from: '"' + CONFIG.CONSTANTS.SITE_TITLE + '" <' + CONFIG.EMAIL.SMTP_EMAIL + '>',
                to: maildata.to,
                subject: maildata.subject,
            }
            //console.log(transporter,send_mail_document);

            switch (maildata.type) {
                case 'register-account':
                    await _read_html_file(CONFIG.CONSTANTS.EMAIL_TEMPLATE_PATH + '/register-account.html').then(function (html) {
                        var template = handlebars.compile(html);

                        var replacements = {
                            employee_name: maildata.data.employee_name,
                            email: maildata.data.email,
                            password: maildata.data.password,
                            copyright_year: new Date().getFullYear(),
                            app_url: CONFIG.CONSTANTS.FRONTEND_URL,
                            app_logo: CONFIG.CONSTANTS.LOGO,
                            site_title: CONFIG.CONSTANTS.SITE_TITLE,
                        };

                        send_mail_document.html = template(replacements);
                    }).catch(function (error) {
                        throw error;
                    })
                    break;
                default:
                    send_mail_document.text = maildata.text;
                    send_mail_document.html = maildata.html;
                    break;
            }

            let info = await transporter.sendMail(send_mail_document);
            return { status: 'success', message: 'Success', data: info };
        } catch (e) {
            return { status: 'error', message: e.message };
        }
    },

}

async function _read_html_file(path, callback) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
            if (err) {
                reject(err);
            } else {
                resolve(html)
            }
        });
    });
};
function getDateOnly(date) {
    var moment = require('moment-timezone');
    var date = new Date(date);
    // const dateNew = moment.utc(utcDt, utcDtFormat).tz(timezone).format('YYYY-MM-DD hh:mm:ss A');
    const dateNew = moment.utc(date, null).tz('America/Los_Angeles').add(1, 'd').format('DD/MM/YYYY');
    return dateNew
}
function getDateTimeOnly(date) {
    var moment = require('moment-timezone');
    var date = new Date(date);
    // const dateNew = moment.utc(utcDt, utcDtFormat).tz(timezone).format('YYYY-MM-DD hh:mm:ss A');
    const dateNew = moment.utc(date, null).tz('America/Los_Angeles').add(1, 'd').format('DD/MM/YYYY hh:mm:ss A');
    return dateNew
}