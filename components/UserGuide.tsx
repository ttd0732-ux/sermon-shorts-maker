"use client";

// Built-in user guide (사용 설명서) — opened from the setup screen.
// Covers the 4 steps, Gemini API key, manual YouTube upload, FAQ and contact.
// No auto-upload and no Google audit content: this app uploads manually.

export default function UserGuide({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-2xl rounded-2xl border border-line bg-panel p-6 shadow-xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-2xl font-extrabold">📖 사용 설명서</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line px-3 py-1 text-sm text-muted hover:text-white"
          >
            닫기 ✕
          </button>
        </div>

        <Section n="1" title="앱 사용법 (4단계)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>설교 유튜브 링크를 넣고 Gemini API 키를 입력한 뒤 &ldquo;하이라이트 찾아 쇼츠 만들기&rdquo;를 누릅니다.</li>
            <li>AI가 찾은 쇼츠 목록에서 만들 쇼츠를 고릅니다.</li>
            <li>24종 디자인 중 하나를 고릅니다.</li>
            <li>&ldquo;이 디자인으로 쇼츠 만들기&rdquo;를 누르면 영상이 만들어집니다. 만든 영상은 MP4로 받아 유튜브 스튜디오에서 직접 올립니다.</li>
          </ol>
        </Section>

        <Section n="2" title="Gemini API 키 받는 법 (무료)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-accent underline"
              >
                Google AI Studio
              </a>
              에 들어갑니다 (구글 로그인 필요).
            </li>
            <li>&ldquo;Create API key&rdquo;를 눌러 키를 만듭니다.</li>
            <li>키를 복사해서 앱의 &ldquo;Gemini API 키&rdquo; 칸에 붙여넣습니다.</li>
            <li>키는 목사님 PC에만 저장되고, 다른 곳으로 보내지지 않습니다.</li>
          </ol>
        </Section>

        <Section n="3" title="유튜브에 직접 올리는 법 (7단계)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>4단계 화면에서 MP4 파일을 받습니다.</li>
            <li>유튜브 스튜디오(studio.youtube.com)를 엽니다.</li>
            <li>오른쪽 위 &ldquo;만들기&rdquo; → &ldquo;동영상 업로드&rdquo;를 누릅니다.</li>
            <li>받은 MP4 파일을 선택합니다.</li>
            <li>앱의 &ldquo;직접 올리기&rdquo; 버튼에서 제목·설명·해시태그를 복사해 붙여넣습니다.</li>
            <li>공개 상태를 &ldquo;예약&rdquo;으로 바꾸고 날짜·시간을 정합니다.</li>
            <li>&ldquo;게시&rdquo;를 누르면 예약된 시간에 자동으로 공개됩니다.</li>
          </ol>
        </Section>

        <Section n="4" title="자주 묻는 문제">
          <ul className="space-y-2">
            <li><b>링크만 넣으면 되나요?</b> — 네. 교안 입력은 없습니다. 링크만으로 분석합니다.</li>
            <li><b>자막이 없는 영상이면요?</b> — 원고 문장으로 자막을 대신 만듭니다.</li>
            <li><b>영상이 안 받아질 때</b> — 링크가 공개 영상인지 확인해 주세요. 비공개·연령 제한 영상은 안 됩니다.</li>
            <li><b>앱이 안 켜질 때</b> — 압축을 다시 풀고, 풀린 폴더 안의 exe를 더블클릭해 주세요.</li>
            <li><b>오류가 뜨면</b> — 앱을 완전히 껐다가 다시 켜고, 같은 문제가 반복되면 아래 문의처로 알려주세요.</li>
          </ul>
        </Section>

        <Section n="5" title="문의처">
          <p>앱 문의) shs목사 · ttd0732@hanmail.net</p>
        </Section>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-xl bg-accent py-3 text-base font-extrabold text-black transition hover:bg-accent2"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-lg font-bold">
        <span className="text-accent">{n}. </span>
        {title}
      </h3>
      <div className="text-sm leading-relaxed text-white/90">{children}</div>
    </div>
  );
}
