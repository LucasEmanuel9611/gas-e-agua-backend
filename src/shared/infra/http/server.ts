import { runScheduledTasks } from "../tasks"; // importe seu index de jobs
import { app, port } from "./app";

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  runScheduledTasks();
});
