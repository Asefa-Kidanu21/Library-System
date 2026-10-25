
import api from "../../services/api.js";

// Librarian: get all loans.
export async function getAllLoans() {
  const response = await api.get("/loans");
  return response.data;
}

// Student: get only the signed-in student's loans.
export async function getMyLoans() {
  const response = await api.get("/loans/my");
  return response.data;
}

// Librarian: issue a book to a student.
export async function createLoan(loanData) {
  const response = await api.post("/loans", loanData);
  return response.data;
}

// Librarian: process a book return.
export async function returnLoan(id) {
  const response = await api.patch(`/loans/${id}/return`);
  return response.data;
}
