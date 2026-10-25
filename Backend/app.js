import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";


import userRoutes from "./src/features/users/userRoutes.js";
import bookRoutes from "./src/features/books/bookRoutes.js";
import dashboardRoutes from "./src/features/dashboard/dashboardRoutes.js";
import bookCopyRoutes from "./src/features/bookCopies/bookCopyRoutes.js";
import loanRoutes from "./src/features/loans/loanRoutes.js";
import categoryRoutes from "./src/features/categories/categoryRoutes.js";
import bookCategoryRoutes from "./src/features/bookCategories/bookCategoryRoutes.js";
import loanRequestRoutes from "./src/features/loanRequests/loanRequestRoutes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(clerkMiddleware({}));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/book-copies", bookCopyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/book-categories", bookCategoryRoutes);
app.use("/api/loan-requests", loanRequestRoutes);






export default app;