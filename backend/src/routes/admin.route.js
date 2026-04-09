import { Router } from "express";
import {verifyJwt} from '../middlewares/auth.middleware.js'
import { upload } from "../middlewares/multer.middleware.js";
import {adminLogin,refreshAccessToken,logoutAdmin,  } from "../controller/admin.controller.js";
import {createHero,getAllHero,getActiveHero,toggleHeroDetail,deleteHero,editHeroDetails} from "../controller/hero.controller.js"
import {createProject,getAllProject,projectEdit,deleteProject} from '../controller/project.controller.js'


const adminRouter = Router()

// admion login routers 
adminRouter.route('/login').post(adminLogin)
adminRouter.route('/refresh-token').post(refreshAccessToken)
adminRouter.route('/logout/').post(verifyJwt,logoutAdmin)


// hero banner routers
adminRouter.route('/createHero').post(upload.single('backgroundImage'), verifyJwt, createHero)
adminRouter.route('/getAllHero').get(verifyJwt, getAllHero)
adminRouter.route('/getActiveHero').get(getActiveHero)
adminRouter.route('/toggleHeroDetail/:id').patch(verifyJwt, toggleHeroDetail)
adminRouter.route('/editHeroDetails/:id').patch(upload.single('backgroundImage'), verifyJwt, editHeroDetails)
adminRouter.route('/deleteHero/:id').delete(verifyJwt, deleteHero)


// router for the projectdetails upload 

adminRouter.route('/createProject').post(upload.single('projectImage'),verifyJwt,createProject )
adminRouter.route('/getAllProject').get(getAllProject)
adminRouter.route('/projectEdit/:id').patch(upload.single('projectImage'),verifyJwt,projectEdit )
adminRouter.route('/deleteProject/:id').delete(verifyJwt,deleteProject )



export {adminRouter}    