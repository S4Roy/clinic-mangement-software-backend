let express = require('express');
let router = express.Router();
const AdminController = require('../controllers/admin/AdminController');
const ClientController = require('../controllers/admin/ClientController');
const ServiceController = require('../controllers/admin/ServiceController');
const AppointmentController = require('../controllers/admin/AppointmentController');

router.post('/details', AdminController.adminDetails);
router.post('/update', AdminController.adminUpdate);
router.post('/change-password', AdminController.adminChangePassword);
/* User */
router.post('/user/list', AdminController.list);
router.post('/user/add', AdminController.add);
router.post('/user/details', AdminController.details);
router.post('/user/update', AdminController.update);
router.post('/user/status-change', AdminController.statuschange);
router.post('/user/change-password', AdminController.changePassword);
// Client
router.post('/client/list', ClientController.list);
router.post('/client/add', ClientController.add);
router.post('/client/details', ClientController.details);
router.post('/client/update', ClientController.update);
router.post('/client/status-change', ClientController.statuschange);
// Service
router.post('/service/list', ServiceController.list);
router.post('/service/add', ServiceController.add);
router.post('/service/details', ServiceController.details);
router.post('/service/update', ServiceController.update);
router.post('/service/status-change', ServiceController.statuschange);
// Service
router.post('/appointment/list', AppointmentController.list);
router.post('/appointment/add', AppointmentController.add);
router.post('/appointment/details', AppointmentController.details);
router.post('/appointment/update', AppointmentController.update);
router.post('/appointment/status-change', AppointmentController.statuschange);

module.exports = router;


