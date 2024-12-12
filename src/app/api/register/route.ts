import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import {sign} from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";


const prisma = new PrismaClient();

interface RegisterRequestBody {
    name: string;
    email: string;
    password: string;
    role?: "VENDEDOR" | "GERENTE";
}

export async function POST(req: Request) {

    const data = await req.json();

    const {name, email, password, role} = data;

    console.log(data)

    if(!name || !email || !password ) {
        return NextResponse.json({message: "Please fill all fields"}, {status: 400});
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if(existingUser) {
            return NextResponse.json({message: "User already exists"}, {status: 400});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data:{
                name,
                email,
                password: hashedPassword,
                role: role || "VENDEDOR"
            }
        });

        return NextResponse.json({message: "User created", user}, {status: 201});

    } catch (error) {

        return NextResponse.json({message: "Internal server error"}, {status: 500});
    }
}