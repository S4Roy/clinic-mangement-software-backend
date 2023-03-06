const express = require('express');
const cors = require('cors');
var bodyParser = require('body-parser')
const mongoose = require('./config/db_connection');
require('./config/config');


const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }))


app.get(CONFIG.SERVER.BASEPATH + '/', (req, res) => res.send("<h3 style='text-align:center; padding:10% 0;'>Welcome to Cal Play Sports Backend</h3>"));


const AdminAuthController = require('./controllers/admin/AdminAuthController');
const EmployeeAuthController = require('./controllers/emplyoee/EmployeeAuthController');



const middleware = require('./middleware/middleware');

app.post(CONFIG.SERVER.BASEPATH + '/admin/login', AdminAuthController.login);
app.post(CONFIG.SERVER.BASEPATH + '/admin/auth-check', AdminAuthController.auth_check);
app.use(CONFIG.SERVER.BASEPATH + '/admin', middleware.checkAuth, middleware.authRole(['admin']), require('./routes/admin'));
app.post(CONFIG.SERVER.BASEPATH + '/employee/login', EmployeeAuthController.login);
app.use(CONFIG.SERVER.BASEPATH + '/employee', middleware.checkAuth, middleware.authRole(['employee']), require('./routes/employee'));

app.post(CONFIG.SERVER.BASEPATH + '*', function (req, res) {
  res.status(200).send({ status: 'error', 'message': 'Oops! Page not found' });
});

app.listen(CONFIG.SERVER.PORT, CONFIG.SERVER.HOSTNAME, () => {
  console.log(`Server running at http://${CONFIG.SERVER.HOSTNAME}:${CONFIG.SERVER.PORT}/`);
});