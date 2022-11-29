//users validations-------
//validation for title(if we get title big alphabet )
exports.nameValidate = new RegExp(/^[a-zA-Z\s]*$/);

//validation for phone number
exports.phoneValidate = new RegExp(/^([+]\d{2})?\d{10}$/);

//validation for email 
exports.emailValidate = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-][a-z]{1,4}$/);

//validation for password
exports.passValidate = new RegExp(/^(?=.*\d)(?=.*[a-zA-Z]).{8,15}$/);

//book validations--------
//ISBN validation
exports.ISBNValidate = new RegExp(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/);