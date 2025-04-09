const fs = require('fs');
const path = require('path');

// 환경 변수에서 API 키 가져오기
const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

if (!apiKey) {
  console.error('Error: REACT_APP_OPENAI_API_KEY environment variable is not set');
  process.exit(1);
}

// 빌드된 JavaScript 파일들을 찾습니다
const buildPath = path.join(__dirname, '../build/static/js');
const files = fs.readdirSync(buildPath);

// 각 파일에서 플레이스홀더를 실제 API 키로 대체합니다
files.forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(buildPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 플레이스홀더를 실제 API 키로 대체
    if (content.includes('__OPENAI_API_KEY__')) {
      content = content.replace('__OPENAI_API_KEY__', apiKey);
      fs.writeFileSync(filePath, content);
      console.log(`Replaced API key in ${file}`);
    }
  }
}); 