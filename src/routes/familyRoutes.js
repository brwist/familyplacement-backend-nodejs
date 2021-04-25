import express from 'express'
import { createFamily, editFamily ,getFamilies, getFamily} from '../controllers/family.controllers'


const router = express.Router()

router.post('/create', createFamily)
router.put('/edit/:id', editFamily)
router.get("/", getFamilies)
router.get("/specific/:id", getFamily)


module.exports = router