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
    addProjectScreenshots,
    replaceProjectScreenshots,
    removeProjectScreenshot,
    getProjectScreenshots,
} from '../controller/project.controller.js';
import {
    createApp,
    getAllApp,
    editApp,
    deleteApp,
    addAppScreenshots,
    replaceAppScreenshots,
    removeAppScreenshot,
    getAppScreenshots,
} from '../controller/app.controller.js';
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
    toggleAbout,
} from '../controller/about.controller.js';

import {
  createMessageDetails,getMessageDetails,deleteMessageDetails
} from '../controller/message.controller.js';

import {
    createGallery,
    getAllGallery,
    getGallery,
    editGallery,
    deleteGallery,
    addGalleryImages,
    replaceGalleryImages,
    removeGalleryImage,
    getGalleryImagesById,
    getGalleryHeading,
    updateGalleryHeading,
} from '../controller/gallery.controller.js';
import { getFooter, updateFooter } from '../controller/footer.controller.js';

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
// list is PUBLIC (used by the live site); writes require admin auth
adminRouter.route('/createProject').post(upload.single('projectImage'), verifyJwt, createProject);
adminRouter.route('/getAllProject').get(getAllProject);
adminRouter.route('/projectEdit/:id').patch(upload.single('projectImage'), verifyJwt, projectEdit);
adminRouter.route('/deleteProject/:id').delete(verifyJwt, deleteProject);

// project snapshot endpoints — handled by separate functions in the same controller
// upload.array('screenshots', 12) → req.files is a plain array (one field, up to 12 files)
adminRouter
    .route('/addProjectScreenshots/:id')
    .patch(upload.array('screenshots', 12), verifyJwt, addProjectScreenshots);
adminRouter
    .route('/replaceProjectScreenshots/:id')
    .patch(upload.array('screenshots', 12), verifyJwt, replaceProjectScreenshots);
adminRouter
    .route('/removeProjectScreenshot/:id/:publicId')
    .delete(verifyJwt, removeProjectScreenshot);
adminRouter.route('/getProjectScreenshots/:id').get(getProjectScreenshots);


// router for appDetails upload

adminRouter.route('/createApp').post(upload.single('appIcon'), verifyJwt, createApp);
adminRouter.route('/getAllApp').get(getAllApp); // public — used by live site
adminRouter.route('/editApp/:id').patch(upload.single('appIcon'), verifyJwt, editApp);
adminRouter.route('/deleteApp/:id').delete(verifyJwt, deleteApp);

// app snapshot endpoints — handled by separate functions in the same controller (up to 12 files)
adminRouter
    .route('/addAppScreenshots/:id')
    .patch(upload.array('screenshots', 12), verifyJwt, addAppScreenshots);
adminRouter
    .route('/replaceAppScreenshots/:id')
    .patch(upload.array('screenshots', 12), verifyJwt, replaceAppScreenshots);
adminRouter
    .route('/removeAppScreenshot/:id/:publicId')
    .delete(verifyJwt, removeAppScreenshot);
adminRouter.route('/getAppScreenshots/:id').get(getAppScreenshots);

// router for clientDetails

adminRouter.route('/createClient').post(upload.single('logo'), verifyJwt, createClient);
adminRouter.route('/getAllClient').get(getAllClient); // public — used by live site
adminRouter
    .route('/editClientDetails/:id')
    .patch(upload.single('logo'), verifyJwt, editClientDetails);
adminRouter.route('/deleteClient/:id').delete(verifyJwt, deleteClient);

// router for teamdetails

adminRouter.route('/createTeam').post(upload.single('teamImage'), verifyJwt, createTeam);
adminRouter.route('/getAllteam').get(getAllteam); // public — used by live site
adminRouter
    .route('/editTeamDetails/:id')
    .patch(upload.single('teamImage'), verifyJwt, editTeamDetails);
adminRouter.route('/deleteTeamDetails/:id').delete(verifyJwt, deleteTeamDetails);

// router for testiomonail

adminRouter.route('/createTestimonial').post(upload.single('avatar'), verifyJwt, createTestimonial);
adminRouter.route('/getAlltestiomonail').get(getAlltestiomonail); // public — used by live site
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
adminRouter.route('/toggleAbout/:id').patch(verifyJwt, toggleAbout);
adminRouter.route('/editAbout/:id').patch(verifyJwt, editAbout);
adminRouter.route('/deleteAbout/:id').delete(verifyJwt, deleteAbout);

// router for messsage

adminRouter.route('/createMessageDetails').post(createMessageDetails);
adminRouter.route('/getMessageDetails').get(verifyJwt, getMessageDetails);
adminRouter.route('/deleteMessageDetails/:id').delete(verifyJwt, deleteMessageDetails);

// router for gallery
// thumbnail is single (just one cover); images are unlimited (capped at 100 for safety)
// public reads (getGallery + getGalleryImagesById), admin writes for the rest
const galleryUpload = upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 100 },
]);
adminRouter.route('/createGallery').post(galleryUpload, verifyJwt, createGallery);
adminRouter.route('/getAllGallery').get(verifyJwt, getAllGallery);
adminRouter.route('/gallery').get(getGallery);
adminRouter
    .route('/editGallery/:id')
    .patch(upload.single('thumbnail'), verifyJwt, editGallery);
adminRouter.route('/deleteGallery/:id').delete(verifyJwt, deleteGallery);

// gallery image (album content) helpers — unlimited (capped at 100 for safety)
adminRouter
    .route('/addGalleryImages/:id')
    .patch(upload.array('images', 100), verifyJwt, addGalleryImages);
adminRouter
    .route('/replaceGalleryImages/:id')
    .patch(upload.array('images', 100), verifyJwt, replaceGalleryImages);
adminRouter
    .route('/removeGalleryImage/:id/:publicId')
    .delete(verifyJwt, removeGalleryImage);
adminRouter.route('/getGalleryImagesById/:id').get(getGalleryImagesById);

// gallery heading (section text above the album grid)
adminRouter.route('/galleryHeading').get(getGalleryHeading);
adminRouter.route('/updateGalleryHeading').patch(verifyJwt, updateGalleryHeading);

// footer
adminRouter.route('/footer-settings').get(getFooter);
adminRouter.route('/updateFooter').patch(verifyJwt, updateFooter);

export { adminRouter };
