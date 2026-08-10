# Attendance Face Verification Protocol Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the attendance-device WSS protocol so the platform can send learner reference photos and receive a device-side face-match result with each attendance record.

**Architecture:** Preserve the existing WSS envelope and introduce `STUDENT_PHOTO_SYNC` / `STUDENT_PHOTO_SYNC_ACK` message types. The platform sends a reference photo and validity metadata; the device acknowledges processing, verifies the live sign-in face locally, and includes the result, score, timestamp, and traceable log identifier in `ATTENDANCE_RECORD`.

**Tech Stack:** Existing DOCX interface specification; python-docx for local DOCX edits; OOXML and ZIP structural validation.

## Global Constraints

- Preserve the original document and write a new revision.
- Do not change the current WSS envelope, authentication flow, or existing message semantics.
- Reference photos are used only for local device-side verification; device-side face logs must be retained for at least 180 days.
- Keep the protocol language consistent with the existing Chinese specification.

---

### Task 1: Define protocol additions in the interface document

**Files:**
- Modify: `E:\泰豪工作目录\考试项目\7月工作文件\江西省安全生产智慧培训考核系统考勤数据推送接口文档（修订）.docx`
- Create: `E:\泰豪工作目录\考试项目\7月工作文件\江西省安全生产智慧培训考核系统考勤数据推送接口文档（接口实现补充）.docx`

**Interfaces:**
- Consumes: Existing WSS message envelope, `ATTENDANCE_RECORD` payload, message type table, error code table, security section, and acceptance section.
- Produces: `STUDENT_PHOTO_SYNC`, `STUDENT_PHOTO_SYNC_ACK`, and face-match result fields in `ATTENDANCE_RECORD`.

- [ ] **Step 1: Add the two message types to the message type table**

Add `STUDENT_PHOTO_SYNC` with direction `平台 -> 设备` and `STUDENT_PHOTO_SYNC_ACK` with direction `设备 -> 平台`.

- [ ] **Step 2: Add a photo synchronization section and JSON examples**

Specify `syncId`, `studentId`, `personName`, `idCard`, `photoBase64`, `photoVersion`, `validFrom`, `validTo`, and `operation` in the downlink payload. Specify acknowledgement code, message, and `syncId` in the acknowledgement payload.

- [ ] **Step 3: Extend the attendance record schema and example**

Add `faceMatchResult`, `faceMatchScore`, `faceMatchTime`, and `faceLogId`; define allowed result values and require them when `verifyType` is `人脸识别`.

- [ ] **Step 4: Update protocol flow, safety, error handling, and acceptance requirements**

Document local matching, result upload, rejection handling for non-matches, encrypted local storage, and a 180-day face-log retention period.

### Task 2: Validate the revised document

**Files:**
- Test: `E:\泰豪工作目录\考试项目\7月工作文件\江西省安全生产智慧培训考核系统考勤数据推送接口文档（接口实现补充）.docx`

**Interfaces:**
- Consumes: Revised DOCX.
- Produces: Evidence that the archive, document XML, paragraphs, and tables are valid and contain every required protocol element.

- [ ] **Step 1: Reopen the DOCX and inspect all added paragraphs, table rows, and examples**

Verify that both synchronization message types, all four attendance fields, the acknowledgement example, and the retention requirement appear exactly once.

- [ ] **Step 2: Validate the OOXML archive**

Use `zipfile.testzip()` and XML parsing for `word/document.xml`; verify the expected table count and nonzero output size.

- [ ] **Step 3: Attempt DOCX rendering and disclose any unavailable renderer**

Run the packaged renderer. If the environment does not provide LibreOffice or Word conversion, report that visual render QA could not be completed while retaining structural validation evidence.
