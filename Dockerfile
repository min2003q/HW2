# 사용할 파이썬 베이스 이미지 (가볍고 최적화된 slim 버전)
FROM python:3.10-slim

# 환경 변수 설정
# 1. 파이썬 출력을 버퍼링 없이 바로 출력 (로그 확인과 크래시 발생시 원인 파악 용이)
ENV PYTHONUNBUFFERED=1
# 2. pyc 파일 생성 방지 (디스크 공간 절약 및 불필요한 I/O 감소)
ENV PYTHONDONTWRITEBYTECODE=1

# 작업 디렉토리 설정
WORKDIR /app

# [선택사항] 모델 추론을 위해 OpenCV 나 다른 C++ 의존성이 필요할 경우, 
# 아래 주석을 풀고 필요한 라이브러리를 설치한 후, apt-get 캐시를 삭제해 이미지 크기를 줄일 수 있습니다.
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     libglib2.0-0 libsm6 libxext6 libxrender-dev build-essential \
#     && rm -rf /var/lib/apt/lists/*

# requirements.txt 파일 복사 및 의존성 설치
# --no-cache-dir 옵션을 사용하여 캐시를 남기지 않아 도커 이미지 용량을 최소화합니다..
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# 애플리케이션 전체 소스 복사 (requirements.txt 설치를 먼저 수행하면, 
# 이 단계 이전 동작은 캐시되어 코드 변경 시 빌드가 빨라짐)
COPY . .

# 보안: 어플리케이션을 root 권한이 아닌 별도의 유저 권한으로 실행 (Security Best Practice)
RUN adduser --disabled-password --gecos "" appuser \
    && chown -R appuser /app
USER appuser

# FastAPI 포트 노출
EXPOSE 8000

# 애플리케이션를 포트 8000으로 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
