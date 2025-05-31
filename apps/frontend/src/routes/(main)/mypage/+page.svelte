<script lang="ts">
  import { onMount } from 'svelte';
  import { client } from '$lib/utils/api';

  let user = $state({
    id: '',
    username: '',
    image: '',
    motherLang: '',
    targetLang: '',
  });

  let currentPw = $state('');
  let newPw = $state('');
  let confirmPw = $state('');
  let msg = $state<string | null>(null);
  let error = $state<string | null>(null);

  let selectedFile = $state<File | null>(null);
  let preview = $state('');
  let fileInput = $state<HTMLInputElement | null>(null);

  onMount(async () => {
    try {
      const res = await client.user.me.$get();
      if (res.ok) {
        const data = await res.json();
        user = data.user;
        preview = user.image;
      } else {
        error = '사용자 정보를 불러오는 데 실패했습니다';
      }
    } catch (e) {
      console.error(e);
      error = '서버와 통신 중 오류가 발생했습니다';
    }
  });

  function showMsg(message: string) {
    msg = message;
    setTimeout(() => {
      msg = null;
    }, 2000);
  }

  function showError(message: string) {
    error = message;
    setTimeout(() => {
      error = null;
    }, 2000);
  }

  async function changePassword() {
    error = msg = null;

    if (newPw !== confirmPw) {
      showError('새 비밀번호가 일치하지 않습니다');
      return;
    }

    try {
      const res = await client.user.me.password.$put({
        json: {
          currentPassword: currentPw,
          newPassword: newPw,
        },
      });

      if (res.ok) {
        showMsg('비밀번호가 변경되었습니다');
        currentPw = newPw = confirmPw = '';
      } else {
        const text = await res.text();
        showError(text || '비밀번호 변경에 실패했습니다');
      }
    } catch (e) {
      console.error(e);
      error = '서버와 통신 중 오류가 발생했습니다';
    }
  }

  function handleFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    selectedFile = file;
    preview = URL.createObjectURL(file);
    uploadImage();
  }

  async function uploadImage() {
    error = null;

    if (!selectedFile) {
      error = '파일을 선택해주세요';
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await client.uploads.$post({
        form: {
          file: new File([selectedFile], selectedFile.name, {
            type: selectedFile.type,
          }),
        },
      });

      if (!res.ok) {
        error = await res.text();
        return;
      }

      const { url } = await res.json();
      const absUrl = `${location.origin}${url}`;

      const res2 = await client.user.me.image.$put({
        json: { imageUrl: absUrl },
      });

      if (res2.ok) {
        user.image = absUrl;
        preview = absUrl;
        selectedFile = null;
      } else {
        error = await res2.text();
      }
    } catch (e) {
      console.error(e);
      error = '이미지 업로드 중 오류가 발생했습니다';
    }
  }
</script>

<div class="mypage-wrapper">
  <h2>마이페이지</h2>

  {#if error}
    <div class="toast error">{error}</div>
  {/if}
  {#if msg}
    <div class="toast success">{msg}</div>
  {/if}

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="card profile-card">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="image-wrapper" onclick={() => fileInput?.click()}>
      <img
        src={preview || '/default-profile.png'}
        alt="프로필 이미지"
        class="profile-image hoverable"
      />
      <p class="hint">클릭하여 프로필 이미지 수정</p>
    </div>
    <input
      type="file"
      accept="image/*"
      bind:this={fileInput}
      style="display: none"
      onchange={handleFileChange}
    />

    <div class="info-grid">
      <div><strong>아이디</strong><br />{user.username}</div>
      <div><strong>모국어</strong><br />{user.motherLang}</div>
      <div><strong>목표 언어</strong><br />{user.targetLang}</div>
    </div>

    <div class="stat-grid">
      <div class="stat-item">
        <h4>총 학습 단어</h4>
        <p>--</p>
      </div>
      <div class="stat-item">
        <h4>레벨</h4>
        <p>--</p>
      </div>
    </div>
  </div>

  <div class="card">
    <h3>비밀번호 변경</h3>
    <form onsubmit={changePassword}>
      <label>
        현재 비밀번호
        <input type="password" bind:value={currentPw} required />
      </label>
      <label>
        새 비밀번호 (최소 8자)
        <input type="password" bind:value={newPw} minlength="8" required />
      </label>
      <label>
        새 비밀번호 확인
        <input type="password" bind:value={confirmPw} minlength="8" required />
      </label>
      <button type="submit">변경하기</button>
    </form>
  </div>
</div>

<style>
  .mypage-wrapper {
    max-width: 600px;
    margin: 2rem auto;
    padding: 1rem;
  }

  .card {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  }

  .image-wrapper {
    text-align: center;
    cursor: pointer;
  }

  .profile-image {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #ccc;
    margin-bottom: 0.5rem;
  }

  .hint {
    font-size: 0.85rem;
    color: #777;
  }

  .info-grid {
    display: flex;
    justify-content: space-between;
    margin: 1rem 0;
    font-size: 0.95rem;
  }

  .stat-grid {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .stat-item {
    flex: 1;
    padding: 1rem;
    border: 1px solid #eee;
    border-radius: 6px;
    text-align: center;
    background-color: #fafafa;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    font-size: 0.9rem;
  }

  input[type='password'] {
    padding: 0.5rem;
    margin-top: 0.25rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    padding: 0.75rem;
    border: none;
    border-radius: 6px;
    background-color: #0070f3;
    color: #fff;
    font-weight: bold;
    cursor: pointer;
  }

  button:hover {
    background-color: #005bb5;
  }

  .toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.75rem 1.25rem;
    border-radius: 6px;
    color: white;
    z-index: 1000;
  }

  .toast.success {
    background-color: #007e33;
  }

  .toast.error {
    background-color: #e00;
  }
</style>
