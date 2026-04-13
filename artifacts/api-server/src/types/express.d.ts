declare namespace Express {
  interface Request {
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      image?: string;
    };
    rawBody?: string;
  }
}
