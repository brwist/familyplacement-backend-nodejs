import catchAsync from "../utils/catchAsync";
import Placement from "../models/PlacementModel";
import Joi from "@hapi/joi";
import httpStatus from "http-status";
import mongoose from "mongoose";

const createApiParamsSchema = Joi.object({
  name: Joi.string().required(),
  country: Joi.string().required(),
  criteria: Joi.object().required(),
});

const createPlacement = catchAsync(async (req, res) => {
  const { name, country, criteria } = req.body;
  const { error } = createApiParamsSchema.validate({ name, country, criteria });

  // error checking before creating any family
  if (error) {
    return res.status(400).send({
      success: false,
      message: error?.details?.[0]?.message,
    });
  }
  const newPlacement = await Placement.create({ name, country, criteria });
  return res.status(httpStatus.OK).json({
    success: true,
    message: "Placement created successfully!",
    newPlacement,
  });
});

const updateApiParamsSchema = Joi.object({
  name: Joi.string(),
  country: Joi.string(),
  criteria: Joi.object(),
});

const editPlacement = catchAsync(async (req, res) => {
  const { ...fieldsToUpdate } = req.body;
  const _id = req.param("id");
  const { error } = updateApiParamsSchema.validate({ ...fieldsToUpdate });
  if (error) {
    return res.status(400).send({
      success: false,
      message: error?.details?.[0]?.message,
    });
  }
  const updatedPlacement = await Placement.findByIdAndUpdate(
    {
      _id,
    },
    fieldsToUpdate,
    { new: true }
  );

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Placement edited successfully!",
    updatedPlacement,
  });
});

const fieldsMatchingAggregation = {
  $lookup: {
    from: "familydatas",
    let: {
      allergic_friendly: "$criteria.allergic_friendly",
      spare_bedroom: "$criteria.spare_bedroom",
      experienced: "$criteria.experienced",
    },
    pipeline: [
      {
        $match: {
          $expr: {
            $or: [
              {
                $eq: [
                  "$characteristics.allergic_friendly",
                  "$$allergic_friendly",
                ],
              },
              {
                $eq: ["$characteristics.spare_bedroom", "$$spare_bedroom"],
              },
              {
                $eq: ["$characteristics.experienced", "$$experienced"],
              },
            ],
          },
        },
      },
    ],
    as: "families",
  },
};

const getPlacement = catchAsync(async (req, res) => {
  let _id = req.param("id");
  try {
    _id = mongoose.Types.ObjectId(_id);
    const placement = await Placement.aggregate([
      { $match: { _id } },
      fieldsMatchingAggregation,
    ]);

    return res
      .status(httpStatus.OK)
      .json({ placement: placement[0], success: true });
  } catch (error) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ success: false, message: "No Placement found with this ID" });
  }
});
const getPlacements = catchAsync(async (req, res) => {
  const placementsWithSameCountry = await Placement.aggregate([
    { $match: { "criteria.same_country": true } },
    fieldsMatchingAggregation,
  ]);
  const placementWithNoSameCountry = await Placement.aggregate([
    { $match: { "criteria.same_country": false } },
    fieldsMatchingAggregation,
  ]);

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Placements fetched successfully!",
    placements: [
      ...sortPlacements(placementsWithSameCountry, 1),
      ...sortPlacements(placementWithNoSameCountry, 0),
    ].sort((a, b) => a.createdAt - b.createdAt),
  });
});

const sortPlacements = (placements, matchingCountInitialValue) => {
  return placements.map(({ criteria, families, ...rest }) => {
    return {
      ...rest,
      criteria,
      families: families
        .map(({ characteristics, ...rest }) => {
          const matchingArray = [
            "allergic_friendly",
            "spare_bedroom",
            "experienced",
          ];
          let matchingCount = matchingCountInitialValue;

          matchingArray.forEach((key) => {
            if (characteristics[key] === criteria[key]) matchingCount++;
          });

          return {
            ...rest,
            characteristics,
            matchingCount,
          };
        })
        .sort((a, b) => b.matchingCount - a.matchingCount),
    };
  });
};

export { createPlacement, editPlacement, getPlacements, getPlacement };
