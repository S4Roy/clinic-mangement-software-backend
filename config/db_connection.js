var mongoose = require('mongoose');
const mongoDBUrl = 'mongodb://127.0.0.1/xyz_clinic';

mongoose.Promise = global.Promise;

mongoose.connect(mongoDBUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    directConnection: true,
    //useFindAndModify: false,
    //useCreateIndex: true,
})
    .then(() => console.log("Db Connected"))
    .catch((error) => console.log(error));

module.exports = mongoose;

