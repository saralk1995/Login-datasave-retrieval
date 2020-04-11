const jwt = require('jsonwebtoken')  //jis se token validate kar paye
const User = require('../models/user')  //uske bad user db me wo token validate kar paye

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')    //isse token me bearer nikal jaega
        const decoded = jwt.verify(token, 'thisissaral')    //isse token valid hy ya nai ye pata lagega
        //ye token user id k sath embed hua tha to jab ye bana hamne pehla argument user id pass kiya tha
        //to us id ko ham token se nikal rhe aur id se db me search kar rhe
        //ye aur ek chj karega ye user find karega aur usme dekhega ki ye token hy k nahin uske pas 
        //agar uske pas ye token hy matlab usne abhi tak logout nai kiya hy
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }

        req.user = user     //ye route ko user de dega to route ko fir wapis se user dhundne ki jarurat nai
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth