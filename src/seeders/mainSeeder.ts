import seedUsers from "./seedUsers";
import seedTasks from "./seedTasks";

(async () => {
    try {
        await seedUsers();
        await seedTasks();
        console.log("Seeding completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error while seeding:", error);
        process.exit(1);
    }
})();
