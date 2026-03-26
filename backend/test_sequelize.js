import { Sequelize } from "sequelize";
try {
  const s = new Sequelize("test", "test", "test", { dialect: "oracle" });
  console.log("Success");
} catch (e) {
  console.error("Failed:", e.message);
}