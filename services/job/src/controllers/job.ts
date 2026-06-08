import axios from "axios";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { getBuffer } from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { tryCatch } from "../utils/tryCatch.js";


export const createCompany = tryCatch(async(req : AuthenticatedRequest, res, next) => {
  const user = req.user;

  if(!user){
    next(new ErrorHandler(401, "Unauthorized"));
    return;
  }

  if(user.role !== 'recruiter'){
    next(new ErrorHandler(403, "Forbidden"));
    return;
  }

  const {name, description, website} = req.body;

  if(!name  || !description || !website){
    next(new ErrorHandler(400, "All fields are required"));
    return;
  }

  console.time("checking existing company");

  const existingCompany = await sql`SELECT company_id FROM companies WHERE name = ${name}`;

  console.timeEnd("checking existing company");

  if(existingCompany.length > 0){
    next(new ErrorHandler(409, "Company already exists"));
    return;
  }

  const file = req.file;

  if(!file){
    next(new ErrorHandler(400, "Company logo is required"));
    return;
  }


  console.time("buffer");

  const buffer = getBuffer(file);

  console.timeEnd("buffer");


  if(!buffer){
    next(new ErrorHandler(500, "Internal Server Error"));
    return;
  }


  console.time("upload service")

  const {data} = await axios.post(`${process.env.UTILS_SERVICE_URL}/api/utils/upload`, {
    buffer
  });

  console.timeEnd("upload service");



  console.time("Inserting record");
  const [company] = await sql`INSERT INTO companies (name, description, website,logo, logo_public_id, recruiter_id) VALUES (${name}, ${description}, ${website}, ${data.url}, ${data.public_id}, ${user.user_id}) RETURNING *`;

  console.timeEnd("Inserting record");

  res.status(201).json({
    success: true,
    company
  });
})