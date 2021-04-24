import catchAsync from "../utils/catchAsync";
import Placement from "../models/PlacementModel";
import Joi from "@hapi/joi";
import httpStatus from "http-status";

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
  characteristics: Joi.object(),
});

const editPlacement = catchAsync(async (req, res) => {
  const { ...fieldsToUpdate } = req.body;
  const _id = req.param("id");
  console.log("id", _id);
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

const getPlacements = catchAsync(async (req, res) => {
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
      sortPlacements(placementsWithSameCountry),
      sortPlacements(placementWithNoSameCountry),
    ].sort((a, b) => a.createdAt - b.createdAt),
  });
});

const sortPlacements = (placements) => {
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
          let matchingCount = 0;

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

export { createPlacement, editPlacement, getPlacements };
