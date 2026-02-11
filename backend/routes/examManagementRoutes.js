const express = require("express");
const router = express.Router();
const examManagementController = require("../controllers/examManagementController");

const {
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategory,
    listSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    toggleSubcategory,
    listExams,
    createExam,
    updateExam,
    deleteExam,
    toggleExam,
    listLevels,
    listExamTypes,
    listExamModules,
    createExamModules,
    listExamQuestions,
    createExamQuestions,
} = examManagementController;

// Categories
router.get("/categories", listCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);
router.patch("/categories/:id/toggle", toggleCategory);

// Subcategories
router.get("/subcategories", listSubcategories);
router.post("/subcategories", createSubcategory);
router.put("/subcategories/:id", updateSubcategory);
router.delete("/subcategories/:id", deleteSubcategory);
router.patch("/subcategories/:id/toggle", toggleSubcategory);

// Exams
router.get("/exams", listExams);
router.post("/exams", createExam);
router.put("/exams/:id", updateExam);
router.delete("/exams/:id", deleteExam);
router.patch("/exams/:id/toggle", toggleExam);

// Levels + Exam Types
router.get("/levels", listLevels);
router.get("/exam-types", listExamTypes);

// Exam Modules + Questions
router.get("/exams/:examId/modules", listExamModules);
router.post("/exams/:examId/modules", createExamModules);
router.get("/exams/:examId/questions", listExamQuestions);
router.post("/exams/:examId/questions", createExamQuestions);

module.exports = router;
