from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.database import db
from app.models.schemas import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/", response_model=list[ProjectResponse])
async def list_projects(current_user=Depends(get_current_user)):
    return await db.project.find_many(
        where={"ownerId": current_user.id},
        order={"createdAt": "desc"},
    )


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_200_OK)
async def create_project(payload: ProjectCreate, current_user=Depends(get_current_user)):
    return await db.project.create(
        data={
            "name": payload.name,
            "description": payload.description,
            "ownerId": current_user.id,
        }
    )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, current_user=Depends(get_current_user)):
    project = await db.project.find_unique(where={"id": project_id})
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if project.ownerId != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    payload: ProjectUpdate,
    current_user=Depends(get_current_user),
):
    project = await db.project.find_unique(where={"id": project_id})
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if project.ownerId != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        return project

    return await db.project.update(
        where={"id": project_id},
        data=update_data,
    )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: str, current_user=Depends(get_current_user)):
    project = await db.project.find_unique(where={"id": project_id})
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if project.ownerId != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    await db.project.delete(where={"id": project_id})
