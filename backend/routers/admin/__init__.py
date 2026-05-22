from fastapi import APIRouter, Depends
from core.dependencies import require_role
from models.user import UserRole

admin_guard = Depends(require_role(UserRole.platform_admin))