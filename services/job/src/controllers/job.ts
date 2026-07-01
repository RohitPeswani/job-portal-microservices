import axios from "axios";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { getBuffer } from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { tryCatch } from "../utils/tryCatch.js";
import { applicationStatusUpdateTemplate } from "../utils/template.js";


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

  const checkCount = await sql`SELECT COUNT(*) FROM companies WHERE recruiter_id = ${user.user_id}`;

  if(checkCount[0].count >= 3){
    next(new ErrorHandler(403, "You can only create 3 companies"));
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

export const deleteCompany = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const user = req.user;

    if(!user){
        next(new ErrorHandler(401, "Unauthorized"));
        return;
    }

    if(user.role !== 'recruiter'){
        next(new ErrorHandler(403, "Forbidden"));
        return;
    }

    const {companyId} = req.params;

    const [company] = await sql`SELECT logo_public_id FROM companies WHERE company_id = ${companyId} AND recruiter_id = ${user.user_id}`;

    if(!company){
        next(new ErrorHandler(404, "Company not found"));
        return;
    }

    const {data : deleteData} = await axios.put(`${process.env.UTILS_SERVICE_URL}/api/utils/delete`, {
        publicId : company.logo_public_id
    });


    await sql`DELETE FROM companies WHERE company_id = ${companyId}`;

    res.status(200).json({
        success: true,
        message: "Company deleted successfully"
    });
})

export const createJob = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const user = req.user;

    if(!user){
        next(new ErrorHandler(401, "Unauthorized"));
        return;
    }

    if(user.role !== 'recruiter'){
        next(new ErrorHandler(403, "Forbidden"));
        return;
    }

    const {title, description, salary, location, job_type, openings, role, work_location,company_id} = req.body;

    console.log(title);

    if(!title || !description || !salary || !location || !openings || !role){
        next(new ErrorHandler(400, "All fields are required"));
        return;
    }

    const [company] = await sql`SELECT company_id FROM companies WHERE company_id = ${company_id} AND recruiter_id = ${user.user_id}`;

    if(!company){
        next(new ErrorHandler(404, "Company not found"));
        return;
    }

    const [job] = await sql`INSERT INTO jobs (title, description, salary, location, job_type, openings, role, work_location, company_id, posted_by_recruiter_id) VALUES (${title}, ${description}, ${salary}, ${location}, ${job_type}, ${openings}, ${role}, ${work_location}, ${company_id}, ${user.user_id}) RETURNING *`;

    const [companyWithJob] = await sql`SELECT c.*, COALESCE(
    (
        SELECT json_agg(j.*) FROM jobs j WHERE j.company_id = c.company_id
    ), '[]'::json) as jobs FROM companies c WHERE c.company_id = ${company_id}`;

    res.status(201).json({
        success: true,
        company: companyWithJob
    });
})


export const updateJob = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const user = req.user;

    if(!user){
        next(new ErrorHandler(401, "Unauthorized"));
        return;
    }

    if(user.role !== 'recruiter'){
        next(new ErrorHandler(403, "Forbidden"));
        return;
    }

    const {jobId} = req.params;
    const {title, description, salary, location, job_type, openings, role, work_location, is_active} = req.body;

    const [job] = await sql`SELECT job_id FROM jobs WHERE job_id = ${jobId} AND posted_by_recruiter_id = ${user.user_id}`;

    if(!job){
        next(new ErrorHandler(404, "Job not found"));
        return;
    }

    const [updatedJob] = await sql`UPDATE jobs SET title = COALESCE(${title}, title), description = COALESCE(${description}, description), salary = COALESCE(${salary}, salary), location = COALESCE(${location}, location), job_type = COALESCE(${job_type}, job_type), openings = COALESCE(${openings}, openings), role = COALESCE(${role}, role), work_location = COALESCE(${work_location}, work_location), is_active = COALESCE(${is_active}, is_active) WHERE job_id = ${jobId} RETURNING *`;

    const [companyWithJob] = await sql`SELECT c.*, COALESCE(
    (
        SELECT json_agg(j.*) FROM jobs j WHERE j.company_id = c.company_id
    ), '[]'::json) as jobs FROM companies c WHERE c.company_id = ${updatedJob.company_id}`;

    res.status(200).json({
        success: true,
        company: companyWithJob
    });
})

export const getAllCompanies = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const user = req.user;

    if(!user){
        next(new ErrorHandler(401, "Unauthorized"));
        return;
    }

    const companies = await sql`SELECT * FROM companies WHERE recruiter_id = ${user.user_id}`;

    res.status(200).json({
        success: true,
        companies
    });
})

export const getCompanyDetails = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const user = req.user;

    if(!user){
        next(new ErrorHandler(401, "Unauthorized"));
        return;
    }

    const {companyId} = req.params;

    const [company] = await sql`SELECT c.*, COALESCE(
    (
        SELECT json_agg(j.*) FROM jobs j WHERE j.company_id = c.company_id
    ), '[]'::json) as jobs FROM companies c WHERE c.company_id = ${companyId}`;

    if(!company){
        next(new ErrorHandler(404, "Company not found"));
        return;
    }

    res.status(200).json({
        success: true,
        company
    });
})

export const getAllActiveJobs = tryCatch(async(req, res, next) => {

    const {title, location} = req.query;

    let queryString = `SELECT j.job_id, j.title, j.description, j.salary, j.location, j.job_type, j.openings, j.role, j.work_location, j.created_at, c.company_id, c.name as company_name, c.logo as company_logo FROM jobs j JOIN companies c ON j.company_id = c.company_id WHERE j.is_active = true`;

    let values = [];
    let paramIndex = 1;

    if(title){
        queryString += ` AND j.title ILIKE $${paramIndex}`;
        values.push(`%${title.toString().toLowerCase()}%`);
        paramIndex++;
    }

    if(location){
        queryString += ` AND j.location ILIKE $${paramIndex}`;
        values.push(`%${location.toString().toLowerCase()}%`);
        paramIndex++;
    }

    queryString += ` ORDER BY j.created_at DESC`;


    const jobs = await sql.query(queryString, values);


    res.status(200).json({
        success: true,
        jobs
    });
})

export const getSingleJob = tryCatch(async(req, res, next) => {
    const {jobId} = req.params;

    const [job] = await sql`SELECT j.* FROM jobs j WHERE j.job_id = ${jobId}`;

    if(!job){
        next(new ErrorHandler(404, "Job not found"));
        return;
    }

    res.status(200).json({
        success: true,
        job
    });
})

export const getApplicationsForJob = tryCatch(async(req: AuthenticatedRequest, res, next) => {
    const user = req.user;

    if(!user){
        next(new ErrorHandler(401, "Unauthorized"));
        return;
    }

    if(user.role !== 'recruiter'){
        next(new ErrorHandler(403, "Forbidden"));
        return;
    }

    const {jobId} = req.params;

    const [job] = await sql`SELECT posted_by_recruiter_id FROM jobs WHERE job_id = ${jobId}`;

    if(!job){
        next(new ErrorHandler(404, "Job not found"));
        return;
    }

    if(job.posted_by_recruiter_id !== user.user_id){
        next(new ErrorHandler(403, "Forbidden you are only allowed to view applications of your jobs"));
        return;
    }

    const applications = await sql`SELECT * FROM applications WHERE job_id = ${jobId} ORDER BY subscribed DESC, applied_at ASC`;

    res.status(200).json({
        success: true,
        applications
    });
})

export const updateApplicationStatus = tryCatch(async(req: AuthenticatedRequest, res, next) => {
    const user = req.user;

    if(!user){
        next(new ErrorHandler(401, "Unauthorized"));
        return;
    }

    if(user.role !== 'recruiter'){
        next(new ErrorHandler(403, "Forbidden"));
        return;
    }

    const {applicationId} = req.params;
    const {status} = req.body;

    const [application] = await sql`SELECT job_id, applicant_email, subscribed FROM applications WHERE application_id = ${applicationId}`;

    if(!application){
        next(new ErrorHandler(404, "Application not found"));
        return;
    }

    const [job] = await sql`SELECT j.title, j.posted_by_recruiter_id FROM jobs j WHERE j.job_id = ${application.job_id}`;

    if(!job){
        next(new ErrorHandler(404, "Job not found"));
        return;
    }

    if(job.posted_by_recruiter_id !== user.user_id){
        next(new ErrorHandler(403, "Forbidden you are only allowed to update applications of your jobs"));
        return;
    }

    const [updatedApplication] = await sql`UPDATE applications SET status = ${status} WHERE application_id = ${applicationId} RETURNING *`;

    const message = {
        to : application.applicant_email,
        subject : `Application Status Update for ${job.title}`,
        html : applicationStatusUpdateTemplate(job.title)
    }

    await axios.post(`${process.env.UTILS_SERVICE_URL}/api/utils/send-email`, message);

    res.status(200).json({
        success: true,
        application: updatedApplication
    });
})

export const getAllRecruiterJobs = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    const user = req.user;

    if(!user){
        next(new ErrorHandler(401, "Unauthorized"));
        return;
    }

    if(user.role !== 'recruiter'){
        next(new ErrorHandler(403, "Forbidden"));
        return;
    }

    const jobs = await sql`SELECT * FROM jobs WHERE posted_by_recruiter_id = ${user.user_id}`;

    res.status(200).json({
        success: true,
        jobs
    });
})