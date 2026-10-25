
import api from "../../services/api.js";

export async function getAllLoanRequests() {
  const response = await api.get("/loan-requests");
  return response.data;
}

export async function getMyLoanRequests() {
  const response = await api.get("/loan-requests/my");
  return response.data;
}

export async function createLoanRequest(bookId) {
  const response = await api.post("/loan-requests", {
    book_id: bookId,
  });

  return response.data;
}

export async function reviewLoanRequest(
  id,
  status,
  reviewNote = ""
) {
  const response = await api.patch(
    `/loan-requests/${id}/review`,
    {
      status,
      review_note: reviewNote,
    }
  );

  return response.data;
}
