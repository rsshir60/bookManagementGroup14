//users validations-------
//validation for title(if we get title big alphabet )
exports.nameValidate = new RegExp(/^[a-zA-Z\s]*$/);

//validation for phone number
exports.phoneValidate = new RegExp(/^([+]\d{2})?\d{10}$/);

//validation for email 
exports.emailValidate = new RegExp(/[a-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,3}/);

//validation for password
exports.passValidate = new RegExp(/^(?=.*\d)(?=.*[a-zA-Z]).{8,15}$/);

//book validations--------
//ISBN validation
exports.ISBNValidate = new RegExp(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/);


exports.isEmpty = function(value){
    if(typeof value ==='undefined' || value ===null)  return false
    if(typeof value ==='string' && value.trim().length ===0)return false
    return true
}


//validation rating range
exports.ratingRange = function(rating) {
    if(rating >= 1 && rating <= 5) return true
    return false;
    }