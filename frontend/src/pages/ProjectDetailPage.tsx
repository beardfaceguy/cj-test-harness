import { FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useProject } from "../hooks/useProjects";
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from "../hooks/useTasks";
import type { Task, TaskStatus, Priority } from "../types";

const STATUS_OPTIONS: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"];
const PRIORITY_OPTIONS: Priority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function TaskCard({
  task,
  projectId,
}: {
  task: Task;
  projectId: string;
}) {
  const updateTask = useUpdateTask(projectId, task.id);
  const deleteTask = useDeleteTask(projectId);

  return (
    <li style={{ border: "1px solid #ddd", padding: 12, margin: "8px 0", borderRadius: 4 }}>
      <strong>{task.title}</strong>
      {task.description && <p style={{ margin: "4px 0" }}>{task.description}</p>}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <select
          value={task.status}
          onChange={(e) =>
            updateTask.mutate({ status: e.target.value as TaskStatus })
          }
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={task.priority}
          onChange={(e) =>
            updateTask.mutate({ priority: e.target.value as Priority })
          }
        >
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button onClick={() => deleteTask.mutate(task.id)}>Delete</button>
      </div>
    </li>
  );
}

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) return <div>Invalid project URL.</div>;

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: tasks, isLoading: tasksLoading } = useTasks(projectId);
  const createTask = useCreateTask(projectId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createTask.mutateAsync({
        title,
        description: description || undefined,
        priority,
      });
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setShowForm(false);
    } catch {
      // createTask.error will hold the error for display
    }
  };

  if (projectLoading) return <div>Loading…</div>;
  if (!project) return <div>Project not found.</div>;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 24 }}>
      <Link to="/projects">← All Projects</Link>
      <h1>{project.name}</h1>
      {project.description && <p>{project.description}</p>}

      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "+ New Task"}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} style={{ margin: "16px 0" }}>
          <input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button type="submit" disabled={createTask.isPending}>
            Create Task
          </button>
        </form>
      )}

      {tasksLoading ? (
        <div>Loading tasks…</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tasks?.map((task) => (
            <TaskCard key={task.id} task={task} projectId={projectId} />
          ))}
          {tasks?.length === 0 && <p>No tasks yet.</p>}
        </ul>
      )}
    </div>
  );
}
