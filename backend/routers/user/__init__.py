from fastapi import Depends
from core.dependencies import require_role
from models.user import UserRole

user_guard = Depends(require_role(UserRole.user))