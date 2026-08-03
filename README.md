# Zzangss' 기술 블로그

`https://zzangss.github.io`에서 서비스하는 개인 기술 블로그다.

## 기술 구성

- Astro
- Markdown / MDX Content Collections
- GitHub Actions
- GitHub Pages

## 로컬 실행

Node.js 22.12 이상이 필요하다.

```bash
npm install
npm run dev
```

배포 전 검증:

```bash
npm run build
```

## 글 작성

`src/content/blog/`에 Markdown 파일을 추가한다.

```yaml
---
title: "글 제목"
description: "목록과 검색 결과에 표시할 설명"
pubDate: 2026-08-01
updatedDate: 2026-08-02
tags: ["spring", "java"]
draft: false
---
```

파일명이 글 주소가 된다. 예를 들어 `spring-transaction.md`는
`/posts/spring-transaction/`으로 발행된다.

`tags`는 사이드바와 태그 페이지에 자동 반영된다. 태그 이름이나 구성을
바꾸려면 각 글의 frontmatter에서 수정하면 된다.

## 배포

`master` 브랜치에 반영되면 GitHub Actions가 검사와 빌드를 수행하고 GitHub
Pages에 배포한다. 저장소의 `Settings → Pages → Source`는 `GitHub Actions`로
설정해야 한다.

## 이전 블로그

티스토리 글 이전 원칙과 체크리스트는
[`docs/tistory-migration.md`](docs/tistory-migration.md)를 따른다.
