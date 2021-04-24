const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const placementSchema = new Schema({
        name: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        criteria: { type: {
            allergic_friendly:     {type: Boolean },
            spare_bedroom:   {type: Boolean },
            experienced:  {type: Boolean },
            same_country:  {type: Boolean },
          },
          required: true
        }
},
{
  timestamps: true
});


const placementData = mongoose.model('placementData', placementSchema);
module.exports = placementData;