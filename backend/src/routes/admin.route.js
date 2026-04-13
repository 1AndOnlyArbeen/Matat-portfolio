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

import {
    createAbout,
    getAllAbout,
    getAbout,
    editAbout,
    deleteAbout,
} from '../controller/about.controller.js';

import {
  createMessageDetails,getMessageDetails,deleteMessageDetails
} from '../controller/message.controller.js';

const adminRouter = Router();

// admion login routers
adminRouter.route('/login').post(adminLogin);
adminRouter.route('/refresh-token').post(refreshAccessToken);
adminRouter.route('/logout/').post(verifyJwt, logoutAdmin);

// hero banner routers
const heroUpload = upload.fields([
    { name: 'backgroundImage', maxCount: 1 },
    { name: 'badgeImage1', maxCount: 1 },
    { name: 'badgeImage2', maxCount: 1 },
]);
adminRouter.route('/createHero').post(heroUpload, verifyJwt, createHero);
adminRouter.route('/getAllHero').get(verifyJwt, getAllHero);
adminRouter.route('/getActiveHero').get(getActiveHero);
adminRouter.route('/toggleHeroDetail/:id').patch(verifyJwt, toggleHeroDetail);
adminRouter.route('/editHeroDetails/:id').patch(heroUpload, verifyJwt, editHeroDetails);
adminRouter.route('/deleteHero/:id').delete(verifyJwt, deleteHero);

// router for the projectdetails upload

const projectUpload = upload.fields([
    { name: 'projectImage', maxCount: 1 },
    { name: 'screenshot', maxCount: 10 }
    
])

adminRouter.route('/createProject').post(upload.single('projectImage'), verifyJwt, createProject);
adminRouter.route('/getAllProject').get(verifyJwt, getAllProject);
adminRouter.route('/projectEdit/:id').patch(upload.single('projectImage'), verifyJwt, projectEdit);
adminRouter.route('/deleteProject/:id').delete(verifyJwt, deleteProject);
// project screenshot 
adminRouter.route('/')





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

adminRouter.route('/createTestimonial').post(upload.single('avatar'), verifyJwt, createTestimonial);
adminRouter.route('/getAlltestiomonail').get(verifyJwt, getAlltestiomonail);
adminRouter
    .route('/editTestiominial/:id')
    .patch(upload.single('avatar'), verifyJwt, editTestiominial);
adminRouter.route('/deleteTestiomonail/:id').delete(verifyJwt, deleteTestiomonial);

// router for about section
// getAbout is public (no jwt) — used by the public site
// the rest need admin auth
adminRouter.route('/createAbout').post(verifyJwt, createAbout);
adminRouter.route('/getAllAbout').get(verifyJwt, getAllAbout);
adminRouter.route('/about').get(getAbout);
adminRouter.route('/editAbout/:id').patch(verifyJwt, editAbout);
adminRouter.route('/deleteAbout/:id').delete(verifyJwt, deleteAbout);

// router for messsage

adminRouter.route('/createMessageDetails').post(createMessageDetails);
adminRouter.route('/getMessageDetails').get(verifyJwt, getMessageDetails);
adminRouter.route('/deleteMessageDetails/:id').delete(verifyJwt, deleteMessageDetails);

export { adminRouter };
