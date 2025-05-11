async function signup(username, password, motherLang, targetLang) {
  try {
    const response = await fetch('http://localhost:3000/user/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, motherLang, targetLang }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '회원가입 실패');
    }

    const data = await response.json();
    console.log('회원가입 성공:', data.token); // JWT 토큰 출력
    return data.token;
  } catch (error) {
    console.error('회원가입 에러:', error.message);
    throw error;
  }
}

// 사용 예시
signup('hyk0520', '0000', 'ko-KR', 'en-US')
  .then((token) => {
    console.log('받은 토큰:', token);
  })
  .catch((error) => {
    console.error('에러 발생:', error.message);
  });
