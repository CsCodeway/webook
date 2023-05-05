import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "../../../../firebase";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";

export const authOptions = {
  providers: [
    GoogleProvider({
      idToken: true,
      secret: process.env.NEXTAUTH_SECRET,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token}) {
      const userRef = db.collection("users").doc(token.sub);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        await userRef.set({
          id: token.sub,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }

      session.user.uid = token.sub;
      return session;
    },
  },
};
export default NextAuth(authOptions);
