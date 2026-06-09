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
      {updateTask.isError && (
        <p style={{ color: "red", fontSize: 12 }}>Update failed. Please try again.</p>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <select
          value={task.status}
          disabled={updateTask.isPending}
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
          disabled={updateTask.isPending}
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
        <button
          onClick={() => deleteTask.mutate(task.id)}
          disabled={deleteTask.isPending}
        >
          Delete
        </button>
      </div>
    </li>
  );
}

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const pid = projectId ?? "";

  const { data: project, isLoading: projectLoading } = useProject(pid);
  const { data: tasks, isLoading: tasksLoading } = useTasks(pid);
  const createTask = useCreateTask(pid);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [showForm, setShowForm] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  if (!projectId) return <div>Invalid project URL.</div>;

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreateError(null);
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
      setCreateError("Failed to create task. Please try again.");
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
          {createError && <p style={{ color: "red" }}>{createError}</p>}
        </form>
      )}

      {tasksLoading ? (
        <div>Loading tasks…</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tasks?.map((task) => (
            <TaskCard key={task.id} task={task} projectId={projectId} />
          ))}
          {tasks?.length === 0 && <li>No tasks yet.</li>}
        </ul>
      )}
    </div>
  );
}
