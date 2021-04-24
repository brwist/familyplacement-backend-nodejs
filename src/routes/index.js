import express from 'express'
import placementRoutes from './placementRoutes'
import familyRoutes from './familyRoutes'

const router = express.Router()

const defaultRoutes = [
  { path: '/family', route:  familyRoutes},
  { path: '/placement', route: placementRoutes },
]

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route)
})

module.exports = router