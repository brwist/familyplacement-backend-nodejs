import express from 'express'
import { createFamily, editFamily ,getFamilies} from '../controllers/family.controllers'


const router = express.Router()

router.post('/create', createFamily)
router.put('/edit/:id', editFamily)
router.get("/", getFamilies)

module.exports = router