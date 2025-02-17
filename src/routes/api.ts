import Router from 'koa-router';
import AuthController from '../controllers/auth.controller';
import TaskController from "../controllers/task.controller";
import authMiddleware from "../middleware/authMiddleware";
import UserController from "../controllers/user.controller";
import {csrfProtection} from "../middleware/csrfProtection";
import Koa from "koa";
import {rbacMiddleware} from "../middleware/rbacMiddleware";

const router = new Router({ prefix: '/api' });

router.get("/csrf-token", (ctx: Koa.Context) => {

    if (!ctx.session) {
        ctx.throw(500, "Session not found");
    }

    ctx.session.csrfToken = ctx.state._csrf;

    ctx.body = {
        csrfToken: ctx.state._csrf,
    };
});

//Auth
router.post('/register', csrfProtection,AuthController.register);
router.post('/login',csrfProtection, AuthController.login);
router.post("/logout", AuthController.logout);
//users

router.get("/users", authMiddleware, UserController.getAll);
router.get('/auth/me', authMiddleware,AuthController.check);

//tasks
router.post("/tasks", authMiddleware,    TaskController.createTask);
router.get("/tasks", authMiddleware, TaskController.getAllTasks);
router.post("/tasks-search", authMiddleware, TaskController.getAllTasks);
router.get("/task-types", authMiddleware, TaskController.taskTypes);
router.get("/tasks/:id", authMiddleware, TaskController.getTaskById);
router.put("/tasks/:id", authMiddleware, TaskController.updateTask);
router.delete("/tasks/:id", authMiddleware,rbacMiddleware("deleteTask"), TaskController.deleteTask);
router.post("/tasks/:id/:user", authMiddleware,    TaskController.assign);



export default router;
