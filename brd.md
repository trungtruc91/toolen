# BRD – Voice Listening & Real-time Transcript Tool

## 1. Tổng quan (Overview)

### 1.1 Mục tiêu

Xây dựng một **web tool đơn giản** cho phép người dùng:

* Nghe / nói tiếng Anh qua microphone
* Hiển thị **transcript tiếng Anh theo thời gian thực (real-time)**
* (Optional) Dịch transcript sang tiếng Việt gần real-time

Tool hướng tới mục tiêu:

* Học và luyện nghe – nói tiếng Anh
* Demo/MVP nhanh
* Chi phí thấp, ưu tiên giải pháp free hoặc near-free

---

### 1.2 Phạm vi (Scope)

**Trong phạm vi:**

* Web-based (desktop browser)
* Real-time Speech-to-Text
* Hiển thị transcript ngay khi người dùng nói
* Translate EN → VI theo câu

**Ngoài phạm vi (giai đoạn đầu):**

* Mobile app
* Upload audio file
* Multi-language nâng cao
* Phân tích phát âm chi tiết (pronunciation scoring)

---

## 2. Đối tượng người dùng (Target Users)

* Người học tiếng Anh cơ bản – trung cấp
* Developer / team nội bộ cần tool demo STT
* Giáo viên / người tạo nội dung học tiếng Anh

---

## 3. User Journey

1. User mở website
2. User nhấn **Start Listening**
3. Browser yêu cầu quyền microphone
4. User nói tiếng Anh
5. Transcript tiếng Anh hiển thị real-time
6. Khi câu nói hoàn tất:

   * Text được gửi lên backend
   * Backend dịch sang tiếng Việt
7. Hiển thị bản dịch tiếng Việt
8. User nhấn **Stop** để kết thúc

---

## 4. Functional Requirements

### 4.1 Speech-to-Text (STT)

* Sử dụng Web Speech API
* Ngôn ngữ: English (en-US)
* Hỗ trợ:

  * interim results (kết quả tạm thời)
  * continuous listening

**Acceptance Criteria:**

* Transcript hiển thị trong vòng < 500ms
* Chữ cập nhật liên tục khi user đang nói

---

### 4.2 Real-time Transcript Display

* Hiển thị transcript tiếng Anh ngay trên UI
* Phân biệt:

  * Interim text (màu nhạt)
  * Final text (màu đậm)

---

### 4.3 Translation (Optional)

* Dịch từ tiếng Anh sang tiếng Việt
* Dịch theo **câu hoàn chỉnh** (final result)
* Sử dụng LibreTranslate thông qua backend

**Acceptance Criteria:**

* Thời gian dịch < 1–2 giây
* Bản dịch dễ hiểu, đủ dùng cho học tập

---

### 4.4 Controls

* Start Listening
* Stop Listening
* Clear transcript (optional)

---

## 5. Non-Functional Requirements

### 5.1 Performance

* Latency thấp
* Không block UI khi đang nghe

### 5.2 Compatibility

* Trình duyệt hỗ trợ chính:

  * Google Chrome
  * Microsoft Edge
* Không đảm bảo hoạt động trên Safari/Firefox (phase 1)

### 5.3 Security

* Không expose API key ở frontend
* Backend chịu trách nhiệm gọi dịch vụ translate

### 5.4 Cost

* Ưu tiên free / near-free
* Không yêu cầu GPU

---

## 6. Technical Architecture

### 6.1 Tech Stack

**Frontend**

* Next.js (React)
* Web Speech API

**Backend**

* Next.js API Routes (Node.js runtime)

**Translation**

* LibreTranslate (public instance hoặc self-host)

---

### 6.2 High-level Architecture

```
Browser (Mic)
   ↓
Web Speech API (STT – real-time)
   ↓
Next.js Client UI
   ↓
API Route (/api/translate)
   ↓
LibreTranslate
```

---

## 7. API Specification

### 7.1 Translate API

**Endpoint**

```
POST /api/translate
```

**Request Body**

```json
{
  "text": "I am learning English"
}
```

**Response**

```json
{
  "vi": "Tôi đang học tiếng Anh"
}
```

---

## 8. UI / UX Requirements

* Giao diện đơn giản, dễ dùng
* Hiển thị song song:

  * English transcript
  * Vietnamese translation
* Rõ ràng trạng thái:

  * Listening
  * Stopped

---

## 9. Limitations & Risks

* Phụ thuộc Web Speech API (browser-specific)
* Không kiểm soát được chất lượng STT model
* Public LibreTranslate có thể giới hạn request

---

## 10. Future Enhancements

* Fallback STT bằng Google Speech-to-Text
* Lưu transcript history
* Download transcript
* Highlight từ đang nói
* Tích hợp LLM để giải thích câu / ngữ pháp

---

## 11. Success Metrics

* Transcript hiển thị mượt, ít delay
* User có thể sử dụng mà không cần hướng dẫn
* Hoàn thành MVP trong thời gian ngắn (1–2 ngày dev)

---

## 12. Kết luận

Tool này là một **MVP web đơn giản, chi phí thấp**, tập trung vào trải nghiệm **real-time transcript**, phù hợp cho học tiếng Anh và demo công nghệ Speech-to-Text.
