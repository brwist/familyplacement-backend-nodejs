import express from 'express'
import { createPlacement, editPlacement, getPlacements } from '../controllers/placement.controllers'


const router = express.Router()

router.post('/create', createPlacement)
router.put('/edit/:id', editPlacement)
router.get('/', getPlacements)


module.exports = router