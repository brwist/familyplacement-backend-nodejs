import catchAsync from "../utils/catchAsync";
import httpStatus from "http-status";
import Family from "../models/FamilyModel";
import Joi from "@hapi/joi";

const createApiParamsSchema = Joi.object({
  name: Joi.string().required(),
  country: Joi.string().required(),
  characteristics: Joi.object(),
});
const createFamily = catchAsync(async (req, res) => {
  const { name, country, characteristics } = req.body;
  const { error } = createApiParamsSchema.validate({
    name,
    country,
    characteristics,
  });

  // error checking before creating any family
  if (error) {
    return res.status(400).send({
      success: false,
      message: error?.details?.[0]?.message,
    });
  }
  const newFamily = await Family.create({ name, country, characteristics });
return  res
    .status(httpStatus.OK)
    .json({
      success: true,
      message: "family created successfully!",
      newFamily,
    });
});

const updateApiParamsSchema = Joi.object({
  name: Joi.string(),
  country: Joi.string(),
  characteristics: Joi.object(),
});

const editFamily = catchAsync(async (req, res) => {
  const { ...fieldsToUpdate } = req.body;
  const _id = req.param("id");
  const { error } = updateApiParamsSchema.validate({ ...fieldsToUpdate });
  if (error) {
    return res.status(400).send({
      success: false,
      message: error?.details?.[0]?.message,
    });
  }
  const updatedFamily = await Family.findByIdAndUpdate(
    {
      _id,
    },
    fieldsToUpdate,
    { new: true }
  );

  return res
    .status(httpStatus.OK)
    .json({
      success: true,
      message: "family edited successfully!",
      updatedFamily,
    });
});

const getFamilies = catchAsync(async (req, res) => {
  const families = await Family.find();
 return res
    .status(httpStatus.OK)
    .json({ success: true, message: "Family edited successfully!", families });
});

export { createFamily, editFamily, getFamilies };
