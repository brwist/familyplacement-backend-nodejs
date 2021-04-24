const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const familySchema = new Schema({
        name: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        characteristics:  {type: {
            allergic_friendly:     {type: Boolean, default: false },
            spare_bedroom:   {type: Boolean, default: false },
            experienced:  {type: Boolean , default: false},
          }, default:  {
            allergic_friendly:   false,
            spare_bedroom: false,
            experienced:  false
          }
        },
},
{
  timestamps: true
});


const familyData = mongoose.model('familyData', familySchema);
module.exports = familyData;