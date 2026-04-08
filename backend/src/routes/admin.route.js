import { Router } from "express";
import {verifyJwt} from '../middlewares/auth.middleware.js'
import { upload } from "../middlewares/multer.middleware.js";
import {adminLogin,refreshAccessToken,logoutAdmin,  } from "../controller/admin.controller.js";
import {createHero,getAllHero,getActiveHero,toggleHeroDetail,deleteHero} from "../controller/hero.controller.js"



const adminRouter = Router()

// admion login routers 
adminRouter.route('/login').post(adminLogin)
adminRouter.route('/refresh-token').post(refreshAccessToken)
adminRouter.route('/logout/').post(verifyJwt,logoutAdmin)


// hero banner routers
adminRouter.route('/createHero').post(upload.single('backgroundImage'), createHero)
adminRouter.route('/getAllHero').get(getAllHero)
adminRouter.route('/getActiveHero').get(getActiveHero)
adminRouter.route('/toggleHeroDetail').patch(toggleHeroDetail)
adminRouter.route('/deleteHero').delete(deleteHero)






export {adminRouter}