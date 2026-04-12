import { Router } from 'express';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { adminLogin, refreshAccessToken, logoutAdmin } from '../controller/admin.controller.js';
import {
    createHero,
    getAllHero,
    getActiveHero,
    toggleHeroDetail,
    deleteHero,
    editHeroDetails,
} from '../controller/hero.controller.js';
import {
    createProject,
    getAllProject,
    projectEdit,
    deleteProject,
} from '../controller/project.controller.js';
import { createApp, getAllApp, editApp, deleteApp } from '../controller/app.controller.js';
import {
    createClient,
    getAllClient,
    editClientDetails,
    deleteClient,
} from '../controller/client.controller.js';
import {
    createTeam,
    getAllteam,
    editTeamDetails,
    deleteTeamDetails,
} from '../controller/team.controller.js';

import {
    createTestimonial,
    getAlltestiomonail,
    editTestiominial,
    deleteTestiomonial,
} from '../controller/testimonial.controller.js';

const adminRouter = Router();

// admion login routers
adminRouter.route('/login').post(adminLogin);
adminRouter.route('/refresh-token').post(refreshAccessToken);
adminRouter.route('/logout/').post(verifyJwt, logoutAdmin);

// hero banner routers
adminRouter.route('/createHero').post(upload.single('backgroundImage'), verifyJwt, createHero);
adminRouter.route('/getAllHero').get(verifyJwt, getAllHero);
adminRouter.route('/getActiveHero').get(getActiveHero);
adminRouter.route('/toggleHeroDetail/:id').patch(verifyJwt, toggleHeroDetail);
adminRouter
    .route('/editHeroDetails/:id')
    .patch(upload.single('backgroundImage'), verifyJwt, editHeroDetails);
adminRouter.route('/deleteHero/:id').delete(verifyJwt, deleteHero);

// router for the projectdetails upload

adminRouter.route('/createProject').post(upload.single('projectImage'), verifyJwt, createProject);
adminRouter.route('/getAllProject').get(verifyJwt, getAllProject);
adminRouter.route('/projectEdit/:id').patch(upload.single('projectImage'), verifyJwt, projectEdit);
adminRouter.route('/deleteProject/:id').delete(verifyJwt, deleteProject);

// router for appDetails upload

adminRouter.route('/createApp').post(upload.single('appIcon'), verifyJwt, createApp);
adminRouter.route('/getAllApp').get(verifyJwt, getAllApp);
adminRouter.route('/editApp/:id').patch(upload.single('appIcon'), verifyJwt, editApp);
adminRouter.route('/deleteApp/:id').delete(verifyJwt, deleteApp);

// router for clientDetails

adminRouter.route('/createClient').post(upload.single('logo'), verifyJwt, createClient);
adminRouter.route('/getAllClient').get(verifyJwt, getAllClient);
adminRouter
    .route('/editClientDetails/:id')
    .patch(upload.single('logo'), verifyJwt, editClientDetails);
adminRouter.route('/deleteClient/:id').delete(verifyJwt, deleteClient);

// router for teamdetails

adminRouter.route('/createTeam').post(upload.single('teamImage'), verifyJwt, createTeam);
adminRouter.route('/getAllteam').get(verifyJwt, getAllteam);
adminRouter
    .route('/editTeamDetails/:id')
    .patch(upload.single('teamImage'), verifyJwt, editTeamDetails);
adminRouter.route('/deleteTeamDetails/:id').delete(verifyJwt, deleteTeamDetails);

// router for testiomonail

adminRouter.route('/createTestimonial').post(upload.single('avatar'),verifyJwt,createTestimonial)
adminRouter.route('/getAlltestiomonail').get(verifyJwt,getAlltestiomonail)
adminRouter.route('/editTestiominial/:id').patch(upload.single('avatar'),verifyJwt,editTestiominial)
adminRouter.route('/deleteTestiomonial/:id').delete(verifyJwt,deleteTestiomonial)

export { adminRouter };
