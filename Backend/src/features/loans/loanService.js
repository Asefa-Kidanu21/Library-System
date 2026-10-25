
import {
  getAllLoans,
  getLoansByUserId,
  getLoanById,
  createLoan,
  returnLoan,
} from "./loanModel.js";

function validatePositiveId(value, fieldName) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw Object.assign(new Error(`${fieldName} must be a positive integer.`), {
      statusCode: 400,
    });
  }

  return id;
}

export async function listLoans() {
  return getAllLoans();
}

export async function listMyLoans(userId) {
  const id = validatePositiveId(userId, "User ID");
  return getLoansByUserId(id);
}

export async function findLoan(id) {
  const loanId = validatePositiveId(id, "Loan ID");
  const loan = await getLoanById(loanId);

  if (!loan) {
    throw Object.assign(new Error("Loan not found."), {
      statusCode: 404,
    });
  }

  return loan;
}

export async function issueLoan(data) {
  const userId = validatePositiveId(data.user_id, "User ID");
  const bookCopyId = validatePositiveId(
    data.book_copy_id,
    "Book copy ID"
  );

  if (!data.due_at) {
    throw Object.assign(new Error("Due date is required."), {
      statusCode: 400,
    });
  }

  const dueAt = new Date(data.due_at);

  if (Number.isNaN(dueAt.getTime())) {
    throw Object.assign(new Error("Invalid due date."), {
      statusCode: 400,
    });
  }

  if (dueAt.getTime() <= Date.now()) {
    throw Object.assign(new Error("Due date must be in the future."), {
      statusCode: 400,
    });
  }

  return createLoan({ userId, bookCopyId, dueAt });
}

export async function processReturn(id) {
  const loanId = validatePositiveId(id, "Loan ID");
  return returnLoan(loanId);
}
