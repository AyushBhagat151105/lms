"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const tasks = useQuery(api.task.get);
  console.log(tasks);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {tasks?.map((task) => (
        <div key={task._id}>
          <h2>
            {task?.text} - {task?.isCompleted ? "Completed" : "Pending"}
          </h2>
        </div>
      ))}
    </main>
  );
}
