const Banner = require("../models/Banner");
const Category = require("../models/categories");

exports.getHomeData = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const [banners, categories] = await Promise.all([
      Banner.findAll({
        where: { deleted: false, disabled: false },
        order: [["sequence", "ASC"]],
      }),
      Category.findAll({
        where: {
          deleted: false,
          ...(activeOnly === "true" ? { disabled: false } : {}),
        },
        order: [["sequence", "ASC"]],
      }),
    ]);

    res.json({
      status: true,
      data: {
        banners,
        categories,
      },
      message: "Home data fetched",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};
