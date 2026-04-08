const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const previewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const analyzeBtn = document.getElementById('analyze-btn');
const loading = document.getElementById('loading');
const resultContainer = document.getElementById('result-container');
const resetBtn = document.getElementById('reset-btn');

const machineNameEl = document.getElementById('machine-name');
const confidenceScoreEl = document.getElementById('confidence-score');
const instructionsEl = document.getElementById('instructions');
const recommendedMachinesEl = document.getElementById('recommended-machines');

let selectedFile = null;

// 클릭해서 파일 업로드
dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if(e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// 드래그 앤 드롭 애니메이션 및 처리
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if(e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
    }
});

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
    }
    selectedFile = file;
    
    // 이미지 로컬 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        dropZone.classList.add('hidden');
        previewContainer.classList.remove('hidden');
    }
    reader.readAsDataURL(file);
}

// 분석 시작 버튼 클릭 API 통신
analyzeBtn.addEventListener('click', async () => {
    if(!selectedFile) return;

    previewContainer.classList.add('hidden');
    loading.classList.remove('hidden');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        // FastAPI 서버의 /predict/ 엔드포인트 호출
        const response = await fetch('/predict/', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`API 오류가 발생했습니다. (상태 코드: ${response.status})`);
        }

        const data = await response.json();
        
        // 받아온 데이터 렌더링
        machineNameEl.textContent = data.machine_name;
        confidenceScoreEl.textContent = `신뢰도: ${Math.round(data.confidence_score * 100)}%`;
        
        // 운동 방법을 줄바꿈으로 나누어 예쁘게 박스 형태로 변환
        const instructionsText = data.exercise_instructions.split('\n');
        instructionsEl.innerHTML = instructionsText
            .filter(inst => inst.trim() !== '')
            .map(inst => `<div class="instruction-step">${inst}</div>`)
            .join('');

        // 추천 머신 렌더링
        if (data.recommended_machines && data.recommended_machines.length > 0) {
            recommendedMachinesEl.innerHTML = data.recommended_machines
                .map(machine => `<span class="machine-badge">${machine}</span>`)
                .join('');
        } else {
            recommendedMachinesEl.innerHTML = '<span class="text-muted">추천 머신이 없습니다.</span>';
        }

        loading.classList.add('hidden');
        resultContainer.classList.remove('hidden');

    } catch (error) {
        alert('분석을 실패했습니다: ' + error.message);
        loading.classList.add('hidden');
        dropZone.classList.remove('hidden');
        selectedFile = null;
        fileInput.value = '';
    }
});

// 다른 사진 분석하기 클릭
resetBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    resultContainer.classList.add('hidden');
    dropZone.classList.remove('hidden');
});
