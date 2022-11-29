const express = require('express');
const router = express.Router();

const userController = require('../controller/userController')
const bookController = require('../controller/bookController')
const authController = require('../authController/auth')



//__create_user_API
router.post('/register',userController.createUser)
router.post('/login',userController.loginUser)

//__books_API
router.post("/books", authController.authentication ,bookController.createBooks)
router.get('/books',authController.authentication,bookController.getBooks)

//__deleteBook__Api
router.delete('/books/:bookId',bookController.deleteBook)


router.all("/*", (req, res)=>{
    return res.status(400).send({status:false, message:"check your URL"})
})

module.exports = router