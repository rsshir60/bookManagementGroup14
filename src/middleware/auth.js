const jwt = require('jsonwebtoken')

//__authetication 

exports.authentication = function (req, res, Next) {
  const token = req.headers["x-api-key"]
  // console.log(token)
  
  if (!token) return res.status(400).send({ status: false, msg: "token must be present" });

  jwt.verify(token, "project3-room14-key", function(err, decoded) { 
    
    if(err) {return res.status(401).send({status:false,msg:"please enter valid token"})}
    else{
      
      req.decodedToken = decoded
      Next() 
    } 
  })
};






