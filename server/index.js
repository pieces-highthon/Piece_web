// ============================================================
// Piece_Web 백엔드 서버 (Express)
// - POST /api/orders          : 주문(결제 대기) 생성
// - POST /api/payments/confirm : 토스페이먼츠 결제 승인
// - GET  /api/messages         : 승인 완료된 메시지 목록 조회
// ============================================================
import "dotenv/config";
import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

const app = express();
const PORT = process.env.PORT || 4000;

// ── 미들웨어 ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── 인메모리 저장소 (프로덕션에서는 DB 사용) ─────────────────
// key: orderId, value: { orderId, amount, message, senderName, status, createdAt, paymentKey? }
const orders = new Map();

// ── 환경변수 검증 ─────────────────────────────────────────
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;
if (!TOSS_SECRET_KEY) {
  console.error("❌ TOSS_SECRET_KEY 환경변수가 설정되지 않았습니다.");
  process.exit(1);
}

// ── 토스 API 인증 헤더 생성 ────────────────────────────────
// secretKey + ":" 를 Base64 인코딩하여 Basic 인증 헤더를 만든다
function getTossAuthHeader() {
  const encoded = Buffer.from(TOSS_SECRET_KEY + ":").toString("base64");
  return `Basic ${encoded}`;
}

// ============================================================
// POST /api/orders — 주문 생성 (결제 대기 상태)
// Body: { amount: number, message: string, senderName: string }
// Response: { orderId: string }
// ============================================================
app.post("/api/orders", (req, res) => {
  const { amount, message, senderName } = req.body;

  // ── 입력값 검증 ──
  if (!amount || typeof amount !== "number" || amount < 100) {
    return res.status(400).json({ error: "금액은 100원 이상이어야 합니다." });
  }
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "메시지를 입력해주세요." });
  }
  if (message.length > 50) {
    return res.status(400).json({ error: "메시지는 50자 이내로 입력해주세요." });
  }

  // ── 유니크한 orderId 생성 ──
  // 토스페이먼츠 orderId 규격: 영문 대소문자, 숫자, -, _ 만 허용, 6~64자
  const orderId = `PIECE_${uuidv4().replace(/-/g, "").slice(0, 20)}`;

  // ── 주문 저장 (pending 상태) ──
  orders.set(orderId, {
    orderId,
    amount,
    message: message.trim(),
    senderName: senderName || "익명",
    status: "pending", // pending → paid / failed
    createdAt: new Date().toISOString(),
  });

  console.log(`✅ 주문 생성: ${orderId} | ${amount}원 | "${message}"`);
  return res.json({ orderId });
});

// ============================================================
// POST /api/payments/confirm — 결제 승인 요청
// Body: { paymentKey: string, orderId: string, amount: number }
// ============================================================
app.post("/api/payments/confirm", async (req, res) => {
  const { paymentKey, orderId, amount } = req.body;

  // ── 필수값 확인 ──
  if (!paymentKey || !orderId || !amount) {
    return res.status(400).json({ error: "paymentKey, orderId, amount는 필수입니다." });
  }

  // ── 주문 존재 여부 확인 ──
  const order = orders.get(orderId);
  if (!order) {
    return res.status(404).json({ error: "존재하지 않는 주문입니다." });
  }

  // ── 중복 승인 방지: 이미 결제된 주문 ──
  if (order.status === "paid") {
    return res.status(409).json({ error: "이미 승인된 주문입니다." });
  }

  // ── 금액 위변조 검증: 주문 생성 시 저장한 amount와 일치하는지 확인 ──
  if (order.amount !== amount) {
    console.error(`⚠️ 금액 불일치! 주문: ${order.amount}원, 요청: ${amount}원`);
    return res.status(400).json({ error: "결제 금액이 주문 금액과 일치하지 않습니다." });
  }

  try {
    // ── 토스페이먼츠 승인 API 호출 ──
    const tossResponse = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",
        headers: {
          Authorization: getTossAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      }
    );

    const tossData = await tossResponse.json();

    if (!tossResponse.ok) {
      // ── 토스 승인 실패 ──
      console.error(`❌ 토스 승인 실패: ${tossData.code} - ${tossData.message}`);
      order.status = "failed";
      return res.status(tossResponse.status).json({
        error: tossData.message || "결제 승인에 실패했습니다.",
        code: tossData.code,
      });
    }

    // ── 승인 성공: 메시지를 "paid" 상태로 전환 (롤링페이퍼에 노출됨) ──
    order.status = "paid";
    order.paymentKey = paymentKey;
    order.paidAt = new Date().toISOString();

    console.log(`✅ 결제 승인 완료: ${orderId} | ${amount}원`);
    return res.json({
      success: true,
      orderId,
      amount,
      message: order.message,
      senderName: order.senderName,
    });
  } catch (err) {
    console.error("❌ 토스 API 호출 중 오류:", err);
    return res.status(500).json({ error: "결제 승인 처리 중 서버 오류가 발생했습니다." });
  }
});

// ============================================================
// GET /api/messages — 결제 완료된 메시지 목록 (롤링페이퍼용)
// 승인 완료(paid) 상태의 메시지만 반환
// ============================================================
app.get("/api/messages", (req, res) => {
  const paidMessages = [];
  for (const order of orders.values()) {
    if (order.status === "paid") {
      paidMessages.push({
        message: order.message,
        senderName: order.senderName,
        amount: order.amount,
        paidAt: order.paidAt,
      });
    }
  }
  // 최신순 정렬
  paidMessages.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
  return res.json(paidMessages);
});

// ── 서버 시작 ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Piece 서버 실행 중: http://localhost:${PORT}`);
  console.log(`   환경: ${TOSS_SECRET_KEY.startsWith("test_sk") ? "테스트" : "라이브"} 모드`);
});
