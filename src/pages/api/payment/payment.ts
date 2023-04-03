// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";

import jwtDecode from "jwt-decode";


import axios from "axios";
import { DecodedToken, HandleError } from "@/backend-utils/types";
import { handleAuthorization } from "@/backend-utils/authorization";
import { handleBodyNotEmpty } from "@/backend-utils/validation";
type Response = {
  data: boolean | null;
  errors: HandleError[] | [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  try {
    if (req.method !== "POST") {
      return res.status(403).json({
        data: null,
        errors: [
          {
            message: "invalid method",
          },
        ],
      });
    }

    if (!(await handleAuthorization(req))) {
      return res.status(401).json({
        data: null,
        errors: [
          {
            message: "unauthorized access please login",
          },
        ],
      });
    }

    const token = req.headers.authorization?.split(" ")[1];

    const decodedToken: DecodedToken = await jwtDecode(`${token}`);

    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken.user_id,
      },
      include: {
        client: true,
      },
    });

    if (user?.role !== "client") {
      return res.status(200).json({
        data: null,
        errors: [
          {
            message: "only clients submit payments",
          },
        ],
      });
    }

    const { amount, client_id } = req.body;



    const noEmptyValues = handleBodyNotEmpty(req.body);

    if (noEmptyValues.length > 0) {
      return res.status(200).json({
        data: null,
        errors: [...noEmptyValues],
      });
    }

    const findPayer = await prisma.client.findUnique({
   where:{
    id:Number(client_id)
   }
    });


    if (!findPayer) {
      return res.status(200).json({
        data: null,
        errors: [
          {
            message: "did not find the payer making payment",
          },
        ],
      });
    }

    //insert payment from mpesa

    const data = JSON.stringify({
      BusinessShortCode: 174379,
      Password:
        "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjMwMzI5MTUzNzI4",
      Timestamp: "20230329153728",
      TransactionType: "CustomerPayBillOnline",
      Amount: Number(amount),
      PartyA: Number(process.env.TEST_NUMBER),
      PartyB: 174379,
      PhoneNumber: Number(process.env.TEST_NUMBER),
      CallBackURL: process.env.NEXT_CALLBACK_URL,
      AccountReference: "hiresume",
      TransactionDesc: "Payment of X",
    });
    const response = await axios.post(
      `https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SAFARICOM_BEARER_TOKEN}`,
        },
      }
    );

    await prisma.payment.create({
      data: {
        payment_amount: Number(amount),
         payment_made_by:{
          connect:{
           id:findPayer.id
          }
         }
 
      },
    });

    return res.status(200).json({
      data: true,
      errors: [],
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      data: null,
      errors: [{ message: error.message }],
    });
  }
}
