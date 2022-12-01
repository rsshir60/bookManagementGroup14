const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken")

const { nameValidate, phoneValidate, emailValidate, passValidate, isEmpty } = require("../validations/validators");


//----- create user ---------------
const createUser = async (req, res) => {
  try {
    let userdata = req.body;

    if (Object.keys(userdata) == 0) { return res.status(400).send({ status: false, message: "please provide neccessary details" }) }

    let { title, name, phone, email, password, address } = userdata;

    //Checking if any field is empty
    if (!title) { return res.status(400).send({ status: false, message: "title is mandatory" }) }
    if (!name) { return res.status(400).send({ status: false, message: "name is mandatory" }) }
    if (!phone) { return res.status(400).send({ status: false, message: "phone is mandatory" }) }
    if (!email) { return res.status(400).send({ status: false, message: "email is mandatory" }) }
    if (!password) { return res.status(400).send({ status: false, message: "password is mandatory" }) }


    if (!isEmpty(name)) { return res.status(400).send({ status: false, message: "enter name properly" }) }

    if (title !== "Mr" && title !== "Miss" && title !== "Mrs") {
      return res.status(400).send({ status: false, message: "title should be in Mr/Mrs/Miss" });
    }

    if (!nameValidate.test(name)) { return res.status(400).send({ status: false, message: "enter valid name" }) }

    if (!phoneValidate.test(phone)) { return res.status(400).send({ status: false, message: " enter a valid mobile number" }) }


    let CheckPhoneInDB = await userModel.findOne({ phone: phone })
    if (CheckPhoneInDB) { return res.status(403).send({ status: false, message: "phone number is already exists" }) }


    if (!emailValidate.test(email)) { return res.status(400).send({ status: false, message: "enter a valid email" }) }


    let checkEmailInDB = await userModel.findOne({ email: email })
    if (checkEmailInDB) {
      return res.status(403).send({ status: false, message: "email is already exits" })
    }

    if (!passValidate.test(password)) {
      return res.status(400).send({ status: false, message: "password must between(8 to 15) and one UPPER case and one lower case" })
    }

    // if(isEmpty(address.pincode) || address.pincode.length!==6){
    //   return res.status(400).send({status:false, message:"invalid pincode "})
    // }


    const createdUser = await userModel.create(userdata)
    //possibility of response structuring........

    return res.status(201).send({ status: true, data: createdUser })

  }
  catch (err) {
    console.log("catch err", err);
    return res.status(500).send({ status: false, message: err.message });
  }
}



//__login_user
const loginUser = async function (req, res) {
  try {
      const email = req.body.email;
      const password = req.body.password;

      //checking inputs presense
      if (!email) { return res.status(400).send({ message: " Email is not present" }) }
      if (!password) { return res.status(400).send({ message: " password is not present" }) }

      //checking if email/password exists 
      let User = await userModel.findOne({ email: email, password: password })
      if (!User) { return res.status(404).send({ status: false, message: "email/password not found" }) }

      //token creation
      let token = jwt.sign({ userId: User._id, "iat": (new Date().getTime()) },
        "project3-room14-key", { expiresIn: '1h' });

      return res.status(200).send({ status: true, message: "Success", data: token })

   }
   catch (err) {
     return res.status(500).send({ status: false, message: err.message })
   }
}


module.exports.createUser = createUser
module.exports.loginUser = loginUser
