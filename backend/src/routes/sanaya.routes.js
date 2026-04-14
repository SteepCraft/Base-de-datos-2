import { Router } from "express";
import SanayaController from "../controllers/sanaya.controller.js";

const router = Router();

router.get("/asignaturas/next-id", SanayaController.nextAsignaturaId);
router.post("/terc-pensums/execute-sp", SanayaController.executeSpIngTercPensuns);

router.get("/:entity/options", SanayaController.getOptions);
router.get("/:entity/search", SanayaController.search);
router.get("/:entity", SanayaController.list);
router.get("/:entity/id/:id", SanayaController.getById);
router.get("/:entity/one", SanayaController.getOneByPkQuery);

router.post("/:entity", SanayaController.create);

router.put("/:entity/id/:id", SanayaController.updateById);
router.put("/:entity/one", SanayaController.updateByPkQuery);

router.get("/:entity/id/:id/dependencies", SanayaController.checkDependencies);
router.delete("/:entity/id/:id", SanayaController.deleteById);
router.delete("/:entity/one", SanayaController.deleteByPkQuery);

export default router;
