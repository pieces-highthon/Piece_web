import { useState, useEffect } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import logoPiece from "../assets/logopiece.svg";
import "./Complete.css";

// Vite 환경변수에서 클라이언트 키 로드
const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY;

function Complete({ userName, letterData }) {
  const [showButton, setShowButton] = useState(false);
  // ── 결제 폼 상태 ──
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const confettiColors = [
    "#F9CED7", "#E17992", "#FFD700", "#87CEEB",
    "#98FB98", "#DDA0DD", "#FFA07A",
  ];

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  // ── 결제하기 버튼 클릭 → 결제 폼 표시 ──
  const handlePaymentClick = () => {
    setShowPaymentForm(true);
  };

  // ── 금액 빠른 선택 ──
  const handleQuickAmount = (value) => {
    setAmount(String(value));
  };

  // ── 결제 실행 ──
  const handlePay = async () => {
    setError("");

    // 입력값 검증
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 100) {
      setError("100원 이상 입력해주세요.");
      return;
    }
    if (!supportMessage.trim()) {
      setError("응원 메시지를 입력해주세요.");
      return;
    }
    if (supportMessage.length > 50) {
      setError("메시지는 50자 이내로 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      // ── Step 1: 서버에 주문 생성 요청 ──
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          message: supportMessage.trim(),
          senderName: letterData?.from || "익명",
        }),
      });

      if (!orderRes.ok) {
        const orderErr = await orderRes.json();
        throw new Error(orderErr.error || "주문 생성에 실패했습니다.");
      }

      const { orderId } = await orderRes.json();

      // ── Step 2: 토스페이먼츠 SDK 로드 & 결제창 호출 ──
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: "ANONYMOUS" });

      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: numAmount },
        orderId: orderId,
        orderName: `${userName}님에게 PIECE 후원`,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
      // requestPayment가 성공하면 successUrl로 리다이렉트됨
      // 이 아래 코드는 실행되지 않음
    } catch (err) {
      // 사용자가 결제창을 닫은 경우 등
      setError(err.message || "결제 처리 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <div className="complete-screen">
      {/* ── 컨페티 애니메이션 ── */}
      <div className="confetti-container">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: confettiColors[i % confettiColors.length],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              width: `${6 + Math.random() * 6}px`,
              height: `${6 + Math.random() * 6}px`,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            }}
          />
        ))}
      </div>

      <img src={logoPiece} alt="PIECE" className="complete-logo" />
      <p className="complete-message">{userName}님께 PIECE를 전달드릴게요 !</p>

      {/* ── 결제 폼 (결제하기 버튼 클릭 후 표시) ── */}
      {showPaymentForm && (
        <div className="payment-form">
          {/* 금액 입력 */}
          <div className="payment-field">
            <label className="payment-label">후원 금액</label>
            <div className="payment-amount-row">
              <input
                type="number"
                className="payment-input"
                placeholder="금액 입력"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="100"
                step="100"
              />
              <span className="payment-won">원</span>
            </div>
            <div className="payment-quick-amounts">
              {[1000, 3000, 5000, 10000].map((v) => (
                <button
                  key={v}
                  type="button"
                  className="quick-amount-btn"
                  onClick={() => handleQuickAmount(v)}
                >
                  {v.toLocaleString()}원
                </button>
              ))}
            </div>
          </div>

          {/* 응원 메시지 입력 */}
          <div className="payment-field">
            <label className="payment-label">
              응원 메시지 <span className="char-count">({supportMessage.length}/50)</span>
            </label>
            <input
              type="text"
              className="payment-input"
              placeholder="롤링페이퍼에 남길 한 마디"
              value={supportMessage}
              onChange={(e) => {
                if (e.target.value.length <= 50) setSupportMessage(e.target.value);
              }}
              maxLength={50}
            />
          </div>

          {/* 에러 메시지 */}
          {error && <p className="payment-error">{error}</p>}

          {/* 결제 실행 버튼 */}
          <button
            className="payment-submit-btn"
            onClick={handlePay}
            disabled={isLoading}
          >
            {isLoading ? "처리 중..." : `${Number(amount || 0).toLocaleString()}원 결제하기`}
          </button>
        </div>
      )}

      {/* ── 결제하기 버튼 (4초 후 표시, 폼 미표시 시만) ── */}
      {showButton && !showPaymentForm && (
        <button className="complete-button" onClick={handlePaymentClick}>
          결제하기
        </button>
      )}
    </div>
  );
}

export default Complete;
