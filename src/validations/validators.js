//users validations-------
//validation for title(if we get title big alphabet )
exports.nameValidate = new RegExp(/^[a-zA-Z\s]*$/);

//validation for phone number
exports.phoneValidate = new RegExp(/^([+]\d{2})?\d{10}$/);

//validation for email 
exports.emailValidate = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);

//validation for password
exports.passValidate = new RegExp(/^(?=.*\d)(?=.*[a-zA-Z]).{8,15}$/)