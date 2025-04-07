const fs = require('fs');
const path = require('path');

// 빌드된 JavaScript 파일들을 찾습니다
const buildPath = path.join(__dirname, '../build/static/js');
const files = fs.readdirSync(buildPath);

// 각 파일에서 플레이스홀더를 실제 API 키로 대체합니다
files.forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(buildPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 플레이스홀더를 실제 API 키로 대체
    content = content.replace('__OPENAI_API_KEY__', process.env.REACT_APP_OPENAI_API_KEY || '');
    
    fs.writeFileSync(filePath, content);
  }
}); 