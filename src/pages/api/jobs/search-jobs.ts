// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next";

import { HandleError } from "../../../backend-utils/types";
import { handleAuthorization } from "../../../backend-utils/authorization";
import prisma from "../../../../lib/prisma";
import { Job } from "@prisma/client";

type Response = {
  data: Job[] | null;
  errors: HandleError[] | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  try {
    if (req.method !== "GET") {
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

    const { query } = req.query;

    const jobs = await prisma.job.findMany({
      where: {
        title: {
          search: String(query),
        },
      },
    });

    return res.status(200).json({
      data: jobs,
      errors: null,
    });
  } catch (error: any) {
    return res.status(500).json({
      data: null,
      errors: [{ message: error.message }],
    });
  }
}
