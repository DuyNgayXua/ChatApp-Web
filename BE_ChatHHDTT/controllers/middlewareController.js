const jwt = require("jsonwebtoken");

const middlewareController={

    //verifyToken
    verifyToken:(req,res,next)=>{
        const token = req.headers.token;
        if(token){

            const accessToken= token.split(" ")[1];
            jwt.verify(accessToken,process.env.JWT_ACCESS_kEY,(err,user)=>{

                    if(err){
                       return res.status(403).json("Token Không hợp lệ")
                    }
                    req.user= user;
                    next();

            });
        }
        else{

            return res.status(401).json("Ban chua duoc xac thuc!") 
        }

    },

}

module.exports= middlewareController;



