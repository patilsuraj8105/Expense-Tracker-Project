from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from app.models.user import User
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.services import export_service
import urllib.parse

router = APIRouter(prefix="/export", tags=["export"])

@router.get("/excel")
def export_excel(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category: Optional[str] = None,
    search: Optional[str] = Query(None, max_length=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=422, detail="start_date must be on or before end_date")

    excel_file = export_service.export_expenses_to_excel(
        db=db, user_id=current_user.id, start_date=start_date, end_date=end_date,
        category=category, search=search
    )
    
    filename = "expenses"
    if start_date:
        filename += f"_from_{start_date}"
    if end_date:
        filename += f"_to_{end_date}"
    filename += ".xlsx"
    
    # URL encode filename for header
    encoded_filename = urllib.parse.quote(filename)
    
    headers = {
        'Content-Disposition': f'attachment; filename="{filename}"; filename*=utf-8\'\'{encoded_filename}'
    }
    
    return StreamingResponse(
        excel_file, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers
    )
