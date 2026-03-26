import applyAssociations from "./associations.js";
import * as modelsExports from "./models-export.js";
import { sequelize } from "../config/sequelize.js";

// modelsExports contiene getters que al importarlos ya evaluarán
const models = { ...modelsExports, sequelize };

// aplicar asociaciones
applyAssociations(models);
Object.defineProperty(models, "__associationsApplied", {
  value: true,
  enumerable: false,
  configurable: false,
  writable: false,
});

// exportar modelos
export default models;
