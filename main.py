from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import uvicorn
# import torch # 실제 모델 로드를 위해 필요한 모듈 
# from PIL import Image # 이미지 처리를 위한 모듈
import io

app = FastAPI(
    title="웨이트 머신 분류 API",
    description="사진을 업로드하면 머신 이름과 운동 방법을 반환하는 API입니다.",
    version="1.0.0"
)

# 예측 결과를 담을 데이터 모델
class PredictionResponse(BaseModel):
    machine_name: str
    exercise_instructions: str
    confidence_score: float

# TODO: 실제 MLOps 파이프라인에서 학습된 모델을 로드하는 로직을 여기에 구현합니다.
# model = load_model("path/to/your/model.pt") 

def predict_machine(image_bytes: bytes) -> dict:
    """
    실제 모델 추론 로직이 들어갈 자리입니다.
    현재는 더미(Dummy) 로직으로 동작합니다.
    """
    # image = Image.open(io.BytesIO(image_bytes))
    # outputs = model(image)
    # _, predicted = torch.max(outputs, 1)
    
    # 임시 반환값
    return {
        "machine_name": "스미스 머신 (Smith Machine)",
        "exercise_instructions": "1. 바벨의 적절한 높이를 설정합니다. \n2. 어깨 넓이로 발을 벌리고 바벨을 어깨 위에 올립니다. \n3. 허리를 곧게 펴고 스쿼트 동작을 수행합니다.",
        "confidence_score": 0.95
    }


@app.post("/predict/", response_model=PredictionResponse)
async def predict_weight_machine(file: UploadFile = File(...)):
    """
    이미지를 업로드 받아 예측 결과를 반환하는 엔드포인트
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")
    
    try:
        # 업로드된 이미지 읽기
        image_bytes = await file.read()
        
        # 모델 예측 (더미함수 호출)
        result = predict_machine(image_bytes)
        
        return PredictionResponse(
            machine_name=result["machine_name"],
            exercise_instructions=result["exercise_instructions"],
            confidence_score=result["confidence_score"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"예측 중 오류 발생: {str(e)}")


@app.get("/health")
def health_check():
    """서버 상태 확인용 엔드포인트"""
    return {"status": "ok", "message": "API 서버가 정상적으로 실행 중입니다."}


if __name__ == "__main__":
    # 로컬 테스트용 실행 설정
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
