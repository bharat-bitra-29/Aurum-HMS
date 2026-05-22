from pydantic import BaseModel
from typing import Generic, TypeVar, List

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int


def paginate(query_results: List, page: int = 1, page_size: int = 20) -> dict:
    total = len(query_results)
    start = (page - 1) * page_size
    end = start + page_size
    return {
        "items": query_results[start:end],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }
