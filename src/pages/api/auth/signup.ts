// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { handleAuthorization } from "../../../backend-utils/authorization";
import { HandleError } from "../../../backend-utils/types";
import { handleBodyNotEmpty } from "../../../backend-utils/validation";
import * as argon2 from "argon2";

type Data = {
  created: boolean | null;
  errors: HandleError[] | [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "POST") {
      return res.status(403).json({
        created: false,
        errors: [
          {
            message: "invalid method",
          },
        ],
      });
    }
    const noEmptyValues = handleBodyNotEmpty(req.body);

    if (noEmptyValues.length > 0) {
      return res.status(200).json({
        created: false,
        errors: [...noEmptyValues],
      });
    }
    const { email, firstName, lastName, password, confirmPassword, role } =
      req.body;

    const usernameExists = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (usernameExists) {
      return res.status(200).json({
        created: false,
        errors: [
          {
            message: `already have an account under this ${
              usernameExists ? "username" : "id"
            }`,
          },
        ],
      });
    }

    if (password !== confirmPassword) {
      return res.status(200).json({
        created: false,
        errors: [
          {
            message: "passwords must match",
          },
        ],
      });
    }

    const hash = await argon2.hash(password, {
      hashLength: 10,
    });

    await prisma.user.create({
      data: {
        firstName: String(firstName),
        lastName: String(lastName),
        pictureUrl: `https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/${Math.floor(Math.random() * 1000)}.jpg`,
       
        password: hash,
        email: email,
        role: role,
        client: role === "client" ? { create: {} } : undefined,
        freelancer: role === "freelancer" ? { create: {} } : undefined,
      },
    });

    return res.status(200).json({
      created: true,
      errors: [],
    });
  } catch (error: any) {
    return res.status(500).json({
      created: false,
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
}
