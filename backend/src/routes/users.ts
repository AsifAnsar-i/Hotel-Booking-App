import express,{Request,Response} from 'express';
import User from '../models/user';
import jwt from 'jsonwebtoken';
import {check, validationResult} from 'express-validator';
const router = express.Router();

router.post('/register',[
    check('email', 'Email is required').isEmail(),
    check('password', 'Password must be at least 6 characters long.').isLength({min: 6}),
    check('firstName', 'First name is required.').isString(),
    check('lastName', 'Last name is required.').isString()

], async(req:Request, res:Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({message: errors.array()});
    try {
        let user = await User.findOne({email: req.body.email});
        if(user) return res.status(400).json({message: 'User already registered.'});
        user =new User(req.body);
        await user.save();
        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET_KEY as string,{expiresIn: "1d"});
        res.cookie('auth_token', token, {httpOnly: true, secure: process.env.NODE_ENV === 'production',maxAge: 86400000}); 
        res.status(200).json({message: 'User registered successfully.'});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Something went wrong. Please try again later."});
    }
});

export default router;