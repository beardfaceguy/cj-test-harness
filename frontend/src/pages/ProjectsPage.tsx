import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useCreateProject, useDeleteProject, useProjects } from "../hooks/useProjects";
import { useLogout } from "../hooks/useAuth";

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const logout = useLogout();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await createProject.mutateAsync({ name, description: description || undefined });
    setName("");
    setDescription("");
    setShowForm(false);
  };

  if (isLoading) return <div>Loading projects…</div>;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Projects</h1>
        <button onClick={logout}>Sign Out</button>
      </div>

      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "+ New Project"}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} style={{ margin: "16px 0" }}>
          <input
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit" disabled={createProject.isPending}>
            Create
          </button>
        </form>
      )}

      <ul>
        {projects?.map((project) => (
          <li key={project.id} style={{ margin: "8px 0" }}>
            <Link to={`/projects/${project.id}`}>{project.name}</Link>
            {project.description && (
              <span style={{ marginLeft: 8, color: "#666" }}>
                — {project.description}
              </span>
            )}
            <button
              onClick={() => deleteProject.mutate(project.id)}
              style={{ marginLeft: 16 }}
            >
              Delete
            </button>
          </li>
        ))}
        {projects?.length === 0 && <li>No projects yet. Create one above.</li>}
      </ul>
    </div>
  );
}
