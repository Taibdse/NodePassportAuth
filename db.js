const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    id: String,
    name: String,
    email: String
});

const user = mongoose.model('user', UserSchema, 'user');
module.exports = user;