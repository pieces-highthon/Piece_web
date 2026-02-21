import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./PaymentResult.css";

// ============================================================
// 결제 성공 리다이렉트 페이지
// 토스페이먼츠가 successUrl로 리다이렉트할 때
// ?paymentKey=...&orderId=...&amount=... 쿼리 파라미터를 전달함
// ============================================================
function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = Number(searchParams.get("amount"));

    // 쿼리 파라미터 누락 검증
    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setErrorMsg("결제 정보가 올바르지 않습니다.");
      return;
    }

    // ── 백엔드에 결제 승인(confirm) 요청 ──
    const confirmPayment = async () => {
      try {
        const res = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "결제 승인에 실패했습니다.");
        }

        // 승인 성공
        setResult(data);
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setErrorMsg(err.message);
      }
    };

    confirmPayment();
  }, [searchParams]);

  // ── 로딩 중 ──
  if (status === "loading") {
    return (
      <div className="payment-result-screen">
        <div className="payment-result-card">
          <div className="spinner" />
          <h2>결제 승인 중...</h2>
          <p>잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  // ── 승인 실패 ──
  if (status === "error") {
    return (
      <div className="payment-result-screen">
        <div className="payment-result-card error">
          <div className="result-icon">✕</div>
          <h2>결제 승인 실패</h2>
          <p className="error-message">{errorMsg}</p>
          <Link to="/" className="result-link">
            처음으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // ── 승인 성공 ──
  return (
    <div className="payment-result-screen">
      <div className="payment-result-card success">
        <div className="result-icon">✓</div>
        <h2>결제가 완료되었습니다!</h2>
        <div className="result-details">
          <p><strong>주문번호:</strong> {result.orderId}</p>
          <p><strong>결제금액:</strong> {result.amount?.toLocaleString()}원</p>
          <p><strong>보낸 사람:</strong> {result.senderName}</p>
          <p><strong>메시지:</strong> "{result.message}"</p>
        </div>
        <p className="result-sub">응원 메시지가 롤링페이퍼에 등록되었습니다!</p>
        <Link to="/" className="result-link">
          처음으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default PaymentSuccess;
