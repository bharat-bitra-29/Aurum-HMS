from fastapi import Depends
from core.dependencies import require_role
from models.user import UserRole

hotel_guard = Depends(require_role(UserRole.hotel_admin))
