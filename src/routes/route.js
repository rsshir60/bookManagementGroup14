const express = require('express');
const router = express.Router();

const userController = require('../controller/userContoller')



router.post('/register',userController.createUser)


// handle url 
router.all("/**", (req, res)=>{
    return res.status(400).send({status:false, message:"check your URL"})
})

module.exports = router