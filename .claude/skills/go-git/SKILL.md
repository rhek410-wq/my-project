---
name: go-git
description: 원격 저장소 갱신(remote update) → 새 파일 포함 전체 add → 날짜가 붙은 메시지로 commit → push까지 한 번에 실행한다. 사용자가 "go git", "/go-git"을 입력하거나 변경 사항을 한 번에 커밋·푸시해 달라고 할 때 사용한다.
argument-hint: "[커밋 메시지]"
allowed-tools: Bash(git *), Bash(date *)
---

# go-git

현재 저장소의 변경 사항을 원격과 맞춘 뒤 커밋하고 푸시한다.

인자(커밋 메시지): `$ARGUMENTS`

## 순서

1. **원격 갱신**
   ```
   git remote update
   git status -sb
   ```
   현재 브랜치가 원격보다 뒤처져 있으면(`behind`) 여기서 멈추고 사용자에게 알린다. pull/rebase 여부는 사용자가 정한다.

2. **변경 사항 확인**
   ```
   git status --short
   ```
   변경 사항이 없으면 "커밋할 변경 사항이 없습니다"라고 알리고 끝낸다.

3. **새 파일 포함 전체 add**
   ```
   git add -A
   git diff --cached --stat
   ```

4. **민감 정보 점검** — staged 파일 중 `.env`, 키 파일(`*.pem`, `id_rsa` 등), 토큰·비밀번호·API 키로 보이는 값이 있으면 커밋하지 말고 `git reset`으로 unstage한 뒤 사용자에게 어떤 파일인지 알린다.

5. **커밋 메시지 만들기** — 날짜는 `date '+%Y-%m-%d'`로 구한다.
   - 인자가 비어 있으면: `commit YYYY-MM-DD`
   - 인자가 있으면: `<인자 텍스트> YYYY-MM-DD`

   ```
   git commit -m "<메시지>"
   ```

6. **푸시**
   ```
   git push
   ```
   업스트림이 없으면 `git push -u origin <현재 브랜치>`로 푸시한다.

7. **결과 보고** — 커밋 해시와 메시지, 푸시된 브랜치를 짧게 알린다. 실패한 단계가 있으면 에러 메시지와 함께 그대로 보고한다.
