import { Router } from "express";
import {verifyJwt} from '../middlewares/auth.middleware.js'
import { upload } from "../middlewares/multer.middleware.js";
import {adminLogin,refreshAccessToken,logoutAdmin,  } from "../controller/admin.controller.js";
import {createHero,getAllHero,getActiveHero,toggleHeroDetail,deleteHero,editHeroDetails} from "../controller/hero.controller.js"



const adminRouter = Router()

// admion login routers 
adminRouter.route('/login').post(adminLogin)
adminRouter.route('/refresh-token').post(refreshAccessToken)
adminRouter.route('/logout/').post(verifyJwt,logoutAdmin)


// hero banner routers
adminRouter.route('/createHero').post(verifyJwt, upload.single('backgroundImage'), createHero)
adminRouter.route('/getAllHero').get(verifyJwt, getAllHero)
adminRouter.route('/getActiveHero').get(getActiveHero)
adminRouter.route('/toggleHeroDetail/:id').patch(verifyJwt, toggleHeroDetail)
adminRouter.route('/editHeroDetails/:id').patch(verifyJwt, upload.single('backgroundImage'), editHeroDetails)
adminRouter.route('/deleteHero/:id').delete(verifyJwt, deleteHero)



export {adminRouter}    