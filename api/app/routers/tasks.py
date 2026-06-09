from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth import get_current_user
from app.database import db
from app.models.schemas import TaskCreate, TaskResponse, TaskStatus, TaskUpdate

router = APIRouter(prefix="/projects/{project_id}/tasks", tags=["tasks"])


async def _require_project_access(project_id: str, current_user):
    project = await db.project.find_unique(where={"id": project_id})
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if project.ownerId != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return project


@router.get("/", response_model=list[TaskResponse])
async def list_tasks(
    project_id: str,
    task_status: Optional[TaskStatus] = Query(None, alias="status"),
    current_user=Depends(get_current_user),
):
    await _require_project_access(project_id, current_user)
    where: dict = {"projectId": project_id}
    if task_status is not None:
        where["status"] = task_status.value

    return await db.task.find_many(
        where=where,
        order={"createdAt": "desc"},
    )


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    project_id: str,
    payload: TaskCreate,
    current_user=Depends(get_current_user),
):
    await _require_project_access(project_id, current_user)

    if payload.assigneeId is not None:
        assignee = await db.user.find_unique(where={"id": payload.assigneeId})
        if assignee is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Assignee {payload.assigneeId} not found",
            )

    data = {
        "title": payload.title,
        "description": payload.description,
        "status": payload.status.value,
        "priority": payload.priority.value,
        "dueDate": payload.dueDate,
        "projectId": project_id,
    }
    if payload.assigneeId is not None:
        data["assigneeId"] = payload.assigneeId

    return await db.task.create(data=data)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    project_id: str,
    task_id: str,
    current_user=Depends(get_current_user),
):
    await _require_project_access(project_id, current_user)
    task = await db.task.find_unique(where={"id": task_id})
    if task is None or task.projectId != project_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    project_id: str,
    task_id: str,
    payload: TaskUpdate,
    current_user=Depends(get_current_user),
):
    await _require_project_access(project_id, current_user)
    task = await db.task.find_unique(where={"id": task_id})
    if task is None or task.projectId != project_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        return task

    if "status" in update_data:
        update_data["status"] = update_data["status"].value
    if "priority" in update_data:
        update_data["priority"] = update_data["priority"].value

    if "assigneeId" in update_data and update_data["assigneeId"] is not None:
        assignee = await db.user.find_unique(where={"id": update_data["assigneeId"]})
        if assignee is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Assignee {update_data['assigneeId']} not found",
            )

    return await db.task.update(where={"id": task_id}, data=update_data)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    project_id: str,
    task_id: str,
    current_user=Depends(get_current_user),
):
    await _require_project_access(project_id, current_user)
    task = await db.task.find_unique(where={"id": task_id})
    if task is None or task.projectId != project_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    await db.task.delete(where={"id": task_id})
