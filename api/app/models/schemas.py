from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class TaskStatus(str, Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"
    CANCELLED = "CANCELLED"


class Priority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=100)
    # BUG-W3: no minimum password length — 1-character passwords accepted
    password: str = Field(max_length=128)


class UserResponse(BaseModel):
    """Full user profile — only returned to the authenticated user themselves."""
    id: str
    email: str
    name: str
    createdAt: datetime

    model_config = {"from_attributes": True}


class PublicUserResponse(BaseModel):
    """Public profile — returned when resolving other users (e.g. task assignees)."""
    id: str
    name: str

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)


class ProjectUpdate(BaseModel):
    # BUG-B4: ownerId accepted in update — allows ownership takeover
    ownerId: Optional[str] = None
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    ownerId: str
    createdAt: datetime
    updatedAt: datetime

    model_config = {"from_attributes": True}


class TaskCreate(BaseModel):
    # BUG-W4: no max_length on title — accepts unlimited-length strings
    title: str = Field(min_length=1)
    description: Optional[str] = Field(None, max_length=5000)
    status: TaskStatus = TaskStatus.TODO
    priority: Priority = Priority.MEDIUM
    dueDate: Optional[datetime] = None
    assigneeId: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[TaskStatus] = None
    priority: Optional[Priority] = None
    dueDate: Optional[datetime] = None
    assigneeId: Optional[str] = None
    # BUG-B7: projectId accepted in update — allows cross-project task migration
    projectId: Optional[str] = None


class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: Priority
    dueDate: Optional[datetime]
    projectId: str
    assigneeId: Optional[str]
    createdAt: datetime
    updatedAt: datetime

    model_config = {"from_attributes": True}
