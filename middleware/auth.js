const jwt = require('jsonwebtoken');
const secret = 'anushkatopsecretkey1234';

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization;
    console.log(token);
    if(!token) {
        return res.status(400).json({
            error: 'Unauthorized - No token provided'
        })
    }

    jwt.verify(token.replace('Bearer ', ''), secret, (error, user)=>{
        if(error) {
            return res.status(400).json({
                error: 'Invalid Token'
            })
        } else {
            console.log(user)
        }
        req.user = user;
        next();
    })
}

module.exports = authenticateToken;