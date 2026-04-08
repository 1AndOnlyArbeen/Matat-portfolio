import { Router } from "express";
import {verifyJwt} from '../middlewares/auth.middleware.js'
import {adminLogin,refreshAccessToken,logoutAdmin } from "../controller/admin.controller.js";



const adminRouter = Router()


adminRouter.route("/login").post(adminLogin)
adminRouter.route('/refresh-token').post(refreshAccessToken)
adminRouter.route('/logout/').post(verifyJwt,logoutAdmin)



export {adminRouter}