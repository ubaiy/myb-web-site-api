const express = require("express");
const sequelize = require("./db"); // your sequelize instance
const bannerRoutes = require("./routes/bannerRoutes");
const cors = require('cors');
const app = express();
app.use(cors())
app.use(express.json());
app.use("/api/banners", bannerRoutes);

// Sync DB & start server
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });
