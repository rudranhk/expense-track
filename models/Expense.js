const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    description : {type :String , required : true}, 
    amount : {type : Number, required :true},
    category : {type : String , requried : true}, 
    date : {type : Date, default:Date.now},
    isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Expense',schema);