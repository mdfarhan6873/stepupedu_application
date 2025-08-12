import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        mobileNo: { label: "Mobile Number", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.mobileNo || !credentials?.password || !credentials?.role) {
          throw new Error("Invalid credentials");
        }

        try {
          // Dynamic imports to avoid Edge runtime issues
          const bcrypt = await import("bcryptjs");
          const { connectToDatabase } = await import("@/lib/db");
          const Admin = (await import("@/lib/modals/admin")).default;
          const Student = (await import("@/lib/modals/student")).default;
          const Teacher = (await import("@/lib/modals/teacher")).default;

          await connectToDatabase();

          let user = null;
          const { mobileNo, password, role } = credentials;

          // Check based on role
          switch (role) {
            case "admin":
              user = await Admin.findOne({ mobileNo }).select("+password");
              break;
            case "student":
              user = await Student.findOne({ mobileNo }).select("+password");
              break;
            case "teacher":
              user = await Teacher.findOne({ mobileNo }).select("+password");
              break;
            default:
              throw new Error("Invalid role");
          }

          if (!user) {
            throw new Error("User not found");
          }

          // Check password
          const isPasswordValid = await bcrypt.compare(password as string, user.password);
          
          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          // Return user object without password
          return {
            id: user._id.toString(),
            name: user.name,
            mobileNo: user.mobileNo,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.mobileNo = user.mobileNo;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "student" | "teacher";
        session.user.mobileNo = token.mobileNo as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET,
  // Force Node.js runtime to avoid Edge runtime issues with Mongoose
  trustHost: true,
});
