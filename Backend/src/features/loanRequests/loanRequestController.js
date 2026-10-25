
import {
  listLoanRequests,
  listMyLoanRequests,
  requestBook,
  processLoanRequest,
} from "./loanRequestService.js";

export async function getAllRequests(req, res, next) {
  try {
    const requests = await listLoanRequests();

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyRequests(req, res, next) {
  try {
    const requests = await listMyLoanRequests(req.clerkUserId);

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
}

export async function createRequest(req, res, next) {
  try {
    const request = await requestBook(
      req.clerkUserId,
      req.body.book_id
    );

    res.status(201).json({
      success: true,
      message: "Borrowing request submitted successfully.",
      data: request,
    });
  } catch (error) {
    next(error);
  }
}

export async function reviewRequest(req, res, next) {
  try {
    const librarian = req.libraryUser;

    const request = await processLoanRequest(
      req.params.id,
      req.body.status,
      librarian.id,
      req.body.review_note
    );

    res.json({
      success: true,
      message: `Request ${request.status} successfully.`,
      data: request,
    });
  } catch (error) {
    next(error);
  }
}