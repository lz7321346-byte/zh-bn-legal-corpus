from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/healthz", summary="Health check")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
