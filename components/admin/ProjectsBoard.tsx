"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/inputs";
import type {
  AppRole,
  ProfileRow,
  ProjectRow,
  ProjectStatus,
} from "@/lib/supabase/database.types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { canEditProjects } from "@/lib/admin/permissions";
import { inr, shortDate } from "@/lib/admin/format";
import { cn } from "@/lib/cn";

const COLUMNS: Array<{ key: ProjectStatus; label: string }> = [
  { key: "ongoing", label: "Ongoing" },
  { key: "on_hold", label: "On Hold" },
  { key: "delivered", label: "Delivered" },
  { key: "closed", label: "Closed" },
];

const SERVICE_TYPES = [
  "Website",
  "App",
  "AI integration",
  "Brand",
  "Design prototype",
  "Content",
  "Security",
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function ProjectCard({
  project,
  assignee,
  disabled,
  onOpen,
}: {
  project: ProjectRow;
  assignee?: ProfileRow;
  disabled: boolean;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: project.id,
      disabled,
    });

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      className={cn(
        "cursor-pointer rounded-lg border border-border bg-background/45 p-4 shadow-[0_18px_50px_-35px_rgba(0,0,0,0.9)] transition-colors hover:border-accent/45",
        isDragging && "z-20 border-accent opacity-80"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{project.client_name}</p>
          <p className="mt-1 text-xs text-muted">{project.service_type}</p>
        </div>
        {assignee && (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-foreground/[0.04] text-[0.65rem] text-foreground">
            {initials(assignee.name || assignee.email)}
          </span>
        )}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted">
        <span>{inr(project.value)}</span>
        {project.deadline && (
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {shortDate(project.deadline)}
          </span>
        )}
      </div>
    </article>
  );
}

function Column({
  column,
  projects,
  profiles,
  disabled,
  onOpen,
}: {
  column: (typeof COLUMNS)[number];
  projects: ProjectRow[];
  profiles: ProfileRow[];
  disabled: boolean;
  onOpen: (project: ProjectRow) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.key });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "min-h-[520px] w-[280px] shrink-0 rounded-lg border border-border bg-[#141414]/72 p-3 transition-colors",
        isOver && "border-accent/50 bg-accent/[0.035]"
      )}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="eyebrow">{column.label}</p>
        <span className="font-mono text-xs text-muted">{projects.length}</span>
      </div>
      <div className="space-y-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            assignee={profiles.find((profile) => profile.id === project.assigned_to)}
            disabled={disabled}
            onOpen={() => onOpen(project)}
          />
        ))}
        {!projects.length && (
          <div className="grid min-h-28 place-items-center rounded-md border border-dashed border-border text-center text-xs text-muted">
            drop here
          </div>
        )}
      </div>
    </section>
  );
}

export function ProjectsBoard({
  projects,
  profiles,
  role,
}: {
  projects: ProjectRow[];
  profiles: ProfileRow[];
  role: AppRole;
}) {
  const [items, setItems] = useState(projects);
  const [selected, setSelected] = useState<ProjectRow | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState("");
  const canEdit = canEditProjects(role);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const byColumn = useMemo(() => {
    return COLUMNS.reduce<Record<ProjectStatus, ProjectRow[]>>(
      (acc, column) => {
        acc[column.key] = items.filter((project) => project.status === column.key);
        return acc;
      },
      { ongoing: [], on_hold: [], delivered: [], closed: [] }
    );
  }, [items]);

  const updateProject = async (id: string, patch: Partial<ProjectRow>) => {
    const previous = items;
    setItems((current) =>
      current.map((project) => (project.id === id ? { ...project, ...patch } : project))
    );
    const { error } = await createSupabaseBrowserClient()
      .from("projects")
      .update(patch)
      .eq("id", id);
    if (error) {
      setItems(previous);
      setToast(error.message);
    } else {
      setToast("Saved.");
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    if (!canEdit || !event.over) return;
    const id = String(event.active.id);
    const status = String(event.over.id) as ProjectStatus;
    const project = items.find((item) => item.id === id);
    if (!project || project.status === status) return;
    updateProject(id, { status });
  };

  const removeProject = async (project: ProjectRow) => {
    if (!window.confirm(`Delete ${project.client_name}?`)) return;
    const previous = items;
    setItems((current) => current.filter((item) => item.id !== project.id));
    setSelected(null);
    const { error } = await createSupabaseBrowserClient()
      .from("projects")
      .delete()
      .eq("id", project.id);
    if (error) {
      setItems(previous);
      setToast(error.message);
    } else {
      setToast("Deleted.");
    }
  };

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {canEdit ? "Drag cards between columns to update status." : "Read-only board."}
        </p>
        {canEdit && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            New project
          </Button>
        )}
      </div>

      {toast && (
        <button
          type="button"
          onClick={() => setToast("")}
          className="mb-4 rounded-md border border-border bg-[#141414] px-3 py-2 text-sm text-muted"
        >
          {toast}
        </button>
      )}

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((column) => (
            <Column
              key={column.key}
              column={column}
              projects={byColumn[column.key]}
              profiles={profiles}
              disabled={!canEdit}
              onOpen={setSelected}
            />
          ))}
        </div>
      </DndContext>

      {(selected || showForm) && (
        <ProjectDrawer
          project={selected}
          profiles={profiles}
          canEdit={canEdit}
          onClose={() => {
            setSelected(null);
            setShowForm(false);
          }}
          onSaved={(project) => {
            setItems((current) => {
              const exists = current.some((item) => item.id === project.id);
              return exists
                ? current.map((item) => (item.id === project.id ? project : item))
                : [project, ...current];
            });
            setSelected(project);
            setShowForm(false);
            setToast("Saved.");
          }}
          onDelete={selected ? removeProject : undefined}
        />
      )}
    </>
  );
}

function ProjectDrawer({
  project,
  profiles,
  canEdit,
  onClose,
  onSaved,
  onDelete,
}: {
  project: ProjectRow | null;
  profiles: ProfileRow[];
  canEdit: boolean;
  onClose: () => void;
  onSaved: (project: ProjectRow) => void;
  onDelete?: (project: ProjectRow) => void;
}) {
  const [clientName, setClientName] = useState(project?.client_name ?? "");
  const [serviceType, setServiceType] = useState(project?.service_type ?? SERVICE_TYPES[0]);
  const [value, setValue] = useState(project?.value?.toString() ?? "");
  const [assignedTo, setAssignedTo] = useState(project?.assigned_to ?? "");
  const [deadline, setDeadline] = useState(project?.deadline ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "ongoing");
  const [notes, setNotes] = useState(project?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    const payload = {
      client_name: clientName.trim(),
      service_type: serviceType,
      value: value ? Number(value) : null,
      assigned_to: assignedTo || null,
      deadline: deadline || null,
      status,
      notes: notes.trim() || null,
    };

    const supabase = createSupabaseBrowserClient();
    const result = project
      ? await supabase.from("projects").update(payload).eq("id", project.id).select("*").single()
      : await supabase.from("projects").insert(payload).select("*").single();

    setSaving(false);
    if (result.error || !result.data) {
      setError(result.error?.message || "Could not save project.");
      return;
    }
    onSaved(result.data as ProjectRow);
  };

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        className="absolute inset-0 bg-background/70 backdrop-blur"
        onClick={onClose}
        aria-label="Close project detail"
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-border bg-[#111] p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{project ? "Project detail" : "New project"}</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground">
              {project ? project.client_name : "create project."}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full text-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 grid gap-6">
          <div>
            <label className="eyebrow mb-3 block" htmlFor="project-client">
              Client
            </label>
            <TextInput
              id="project-client"
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <label>
              <span className="eyebrow mb-3 block">Service</span>
              <select
                value={serviceType}
                onChange={(event) => setServiceType(event.target.value)}
                disabled={!canEdit}
                className="h-11 w-full rounded-md border border-border bg-background/40 px-3 text-sm outline-none focus:border-accent"
              >
                {SERVICE_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="eyebrow mb-3 block">Status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as ProjectStatus)}
                disabled={!canEdit}
                className="h-11 w-full rounded-md border border-border bg-background/40 px-3 text-sm outline-none focus:border-accent"
              >
                {COLUMNS.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="eyebrow mb-3 block" htmlFor="project-value">
                Value
              </label>
              <TextInput
                id="project-value"
                type="number"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                disabled={!canEdit}
              />
            </div>
            <label>
              <span className="eyebrow mb-3 block">Assign to</span>
              <select
                value={assignedTo}
                onChange={(event) => setAssignedTo(event.target.value)}
                disabled={!canEdit}
                className="h-11 w-full rounded-md border border-border bg-background/40 px-3 text-sm outline-none focus:border-accent"
              >
                <option value="">Unassigned</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name || profile.email}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <label className="eyebrow mb-3 block" htmlFor="project-deadline">
                Deadline
              </label>
              <TextInput
                id="project-deadline"
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>
          <label>
            <span className="eyebrow mb-3 block">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={!canEdit}
              rows={6}
              className="w-full resize-none rounded-md border border-border bg-background/40 p-3 text-sm font-light leading-relaxed text-foreground outline-none focus:border-accent"
            />
          </label>
        </div>

        {error && <p className="mt-5 text-sm text-accent">{error}</p>}

        <div className="mt-8 flex flex-wrap gap-3">
          {canEdit && (
            <Button onClick={save} disabled={saving || !clientName.trim()}>
              {saving ? "saving" : "save project"}
            </Button>
          )}
          {canEdit && project && onDelete && (
            <Button variant="ghost" onClick={() => onDelete(project)}>
              <Trash2 className="h-4 w-4" />
              delete
            </Button>
          )}
        </div>
      </aside>
    </div>
  );
}
