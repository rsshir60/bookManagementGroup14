const bookModel = require("../Models/booksModel");
const userModel = require("../Models/userModel");


const createBooks = async function(req,res){
    let input1 = req.body
    if(!input1){return res.status(400).send({status:false, message:"Body can not be empty"})}
   
    let {title,excerpt,userId,ISBN,category,subcategory,isDeleted,reviews} = input1
    
    //Checking validity of userId via DB call
    let userIdCheck= await userModel.findById({_id:userId})
    if(!userIdCheck){return res.status().send({status:false, message:"Invalid userId/user not found"})}

    //validations for each input
    if(!title){return res.send(400).send({status:false, message:"title is mandatory."})}
    if(!excerpt){return res.send(400).send({status:false, message:"excerpt is mandatory."})}
    if(!ISBN){return res.send(400).send({status:false, message:"ISBN is mandatory."})}
    if(!category){return res.send(400).send({status:false, message:"category is mandatory."})}
    if(!subcategory){return res.send(400).send({status:false, message:"subcategory is mandatory."})}
    if(!releasedAt){return res.send(400).send({status:false, message:"releasedAt is mandatory."})}


    //Book creation in DB
    let createdBooks= await bookModel.create(input1)
    return res.status(201).send({status:true, message:"Success", data:createdBooks}) //json response expected
}

 

const getBooks = async function(req,res){

    let bookData = await bookModel.find({isDeleted:false}).select({title:1,excerpt:1,userId:1,category:1,releasedAt:1,reviews:1})

    if(!(bookData) || bookData.length == 0){return res.status(404).send({status:false, message:"No Books Found."})}

    return res.status(200).send({status:true, message:"Success", data: bookData})
}

module.exports.createBooks=createBooks
module.exports.getBooks=getBooks

