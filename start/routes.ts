/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// router.on('/').render('pages/home')
router.post('/post_picture', '#controllers/mains_controller.save_file_minio')
router.post('/post_data', '#controllers/mains_controller.save_data_anpr')
router.put('/update_data', '#controllers/mains_controller.update_data_anpr')

router.post('/crossrecord', '#controllers/mains_controller.crossrecord')
router.get('/get-picture', '#controllers/mains_controller.get_image')
router.get('/get-data', '#controllers/mains_controller.get_data_mongo')
router.get('/get-data-aggregation', '#controllers/mains_controller.get_data_mongo_aggregation')
router.get('/get-bucket', '#controllers/mains_controller.getBucket')
router
  .get('/tes/:bucket/:folder/:name', ()=>{})
  .use(middleware.proxy())
