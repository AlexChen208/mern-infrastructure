const jwt = require('jsonwebtoken')
const User = require('../../models/user')
const bcrypt = require('bcrypt')
module.exports = {
    create,
    login,
    checkToken,
}

async function create(req,res) {
    try {
        // Add and Create the user to the database
        const user = await User.create(req.body)
        // token created will be a string
        const token = createJWT(user)
        // Yes, we can use res.json to send back just a string
        // The client code needs to take this into consideration
        res.json(token)
    } catch(err) {
        // Client will check for non-2xx status code 
        // 400 = Bad Request
        console.log(err)
        res.status(400).json(err)
    }
}

// Why we use async/await is because we need to wait for this function to make contact with mongoDB
async function login(req,res) {
    try {
        const user = await User.findOne({email: req.body.email})
        if (!user) return new Error()
        const match = await bcrypt.compare(req.body.password, user.password)
        if (!match) throw new Error()
        res.json( createJWT(user) )
    } catch {
        res.status(400).json('Bad Credentials')
    }
}

function checkToken(req, res) {
    console.log('req.user', req.user)
    res.json(req.exp)
}

/*-- Helper Functions --*/
function createJWT(user) {
    return jwt.sign(
        { user },
        process.env.SECRET,
        { expiresIn: '24h'}
    )
}
