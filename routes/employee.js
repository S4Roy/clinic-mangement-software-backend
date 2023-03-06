let express = require('express');
let router = express.Router();
const EmployeeController = require('../controllers/emplyoee/EmployeeController');
const ClientController = require('../controllers/admin/ClientController');
const ServiceController = require('../controllers/admin/ServiceController');
const AppointmentController = require('../controllers/emplyoee/AppointmentController');
router.post('/details', EmployeeController.details);
router.post('/update', EmployeeController.update);
router.post('/change-password', EmployeeController.changePassword);
router.post('/client/list', ClientController.list);
router.post('/client/add', ClientController.add);
router.post('/client/update', ClientController.update);
router.post('/service/list', ServiceController.list);
router.post('/appointment/list', AppointmentController.list);
router.post('/appointment/add', AppointmentController.add);

module.exports = router;


