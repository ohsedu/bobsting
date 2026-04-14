# Bobsting 프로젝트

## 개요
캘린더 기반 지인들의 식사 기록 공유 앱

## 기술 스택
- Frontend: React Native (Expo) - apps/mobile
- Backend: Supabase (PostgreSQL, Auth, Storage, Realtime)
- 추후 추가: Next.js API Routes (Vercel) - 결제 등 서버 로직용

## 프로젝트 구조
bobsting/
├── apps/
│   ├── mobile/          # Expo 앱 (메인)
│   └── web/             # Next.js (추후)
├── supabase/
│   └── migrations/      # SQL 마이그레이션 파일
└── CLAUDE.md

## Supabase 테이블 구조
- users: 유저 정보 (Supabase Auth 연동, 카카오/구글 로그인)
- groups: 그룹 (1인 다그룹 가능, 초대코드 방식)
- group_members: 그룹 멤버 (role: owner/member)
- posts: 식사 게시글 (meal_date, meal_time, people_count, notify_scope, participant_can_edit)
- post_images: 게시글 이미지 (Supabase Storage 연동)
- post_participants: 같이 먹은 그룹원 태그 (can_edit 권한)
- restaurants: 음식점 (Google Places API 기반, google_place_id)
- post_restaurants: 게시글-음식점 태그 (다대다)
- comments: 댓글
- notifications: 알림 로그 (type: new_post/comment/tag)

## 주요 기능
- 캘린더 모드: 날짜 선택 → 그날 그룹원 식사 피드
- 피드 모드: 날짜순 전체 피드
- 게시글 작성: 사진 업로드, 참여자 태그, 음식점 태그
- 참여자 태그: 태그된 사람 수정/삭제 권한 설정 가능 (작성자가 설정, 기본값 저장됨)
- 알림: 그룹원 전체 or 참여자만 선택 (마지막 선택이 기본값)
- 하루 게시글 제한: 그룹당 1인 최대 10개

## 비즈니스 로직
- 게시글 작성 시 notify_scope 선택 → users.default_notify_scope 업데이트
- 참여자 태그 시 can_edit → posts.participant_can_edit 값 상속
- 음식점은 Google Places API로 검색 후 restaurants 테이블에 저장 (중복 방지: google_place_id unique)
- Storage 경로: post-images/{user_id}/{post_id}/{filename}

## 코딩 컨벤션
- 언어: TypeScript 사용
- 컴포넌트: 함수형 컴포넌트
- 스타일: StyleSheet (추후 tamagui 도입 검토)
- 폴더구조: feature 기반 (auth, feed, calendar, post, group)
- Supabase 클라이언트: lib/supabase.ts에서 싱글톤으로 관리