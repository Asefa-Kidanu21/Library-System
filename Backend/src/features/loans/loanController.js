
import {
  listLoans,
  listMyLoans,
  findLoan,
  issueLoan,
  processReturn,
} from "./loanService.js";

function handleError(res, error) {
  const status = error.statusCode || 500;

  if (status === 500) {
    console.error("Loan error:", error);
  }

  return res.status(status).json({
    success: false,
    message: status === 500
      ? "An unexpected server error occurred."
      : error.message,
  });
}

export async function getAllLoans(req, res) {
  try {
    const loans = await listLoans();

    return res.status(200).json({
      success: true,
      data: loans,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getMyLoans(req, res) {
  try {
    const loans = await listMyLoans(req.libraryUser.id);

    return res.status(200).json({
      success: true,
      data: loans,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getLoan(req, res) {
  try {
    const loan = await findLoan(req.params.id);

    return res.status(200).json({
      success: true,
      data: loan,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function createLoan(req, res) {
  try {
    const loan = await issueLoan(req.body);

    return res.status(201).json({
      success: true,
      message: "Book borrowed successfully.",
      data: loan,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function returnBook(req, res) {
  try {
    const loan = await processReturn(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Book returned successfully.",
      data: loan,
    });
  } catch (error) {
    return handleError(res, error);
  }
}
