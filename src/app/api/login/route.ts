import {PrismaClient} from '@prisma/client';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';


const prisma = new PrismaClient();

interface LoginRequestBody {   
    email: string;
    password: string;
}


export default async function handler(req: NextApiRequest, res: NextApiResponse){

    if(req.method !== "POST"){
        return res.status(405).json({message: "Method not allowed"});
    }

    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({message: "Please fill all fields"});
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if(!user){
            return res.status(400).json({message: "User not found, invalide email or password"});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            return res.status(400).json({message: "User not found, invalide email or password"});
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }

        const token = sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({message: "User logged in", token, user});
        
    } catch (error) {
        res.status(500).json({message: "Internal server error", error});
    }
}