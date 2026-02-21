import { useSearchParams, Link } from "react-router-dom";
import "./PaymentResult.css";

// ============================================================
// 결제 실패 리다이렉트 페이지
// 토스페이먼츠가 failUrl로 리다이렉트할 때
// ?code=...&message=... 쿼리 파라미터를 전달함
// ============================================================
function PaymentFail() {
  const [searchParams] = useSearchParams();

  const errorCode = searchParams.get("code") || "UNKNOWN_ERROR";
  const errorMessage = searchParams.get("message") || "결제에 실패했습니다.";

  return (
    <div className="payment-result-screen">
      <div className="payment-result-card error">
        <div className="result-icon">✕</div>
        <h2>결제 실패</h2>
        <div className="result-details">
          <p><strong>에러 코드:</strong> {errorCode}</p>
          <p><strong>사유:</strong> {errorMessage}</p>
        </div>
        <Link to="/" className="result-link">
          처음으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default PaymentFail;
