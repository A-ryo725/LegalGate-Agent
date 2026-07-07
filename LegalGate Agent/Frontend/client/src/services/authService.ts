import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { auth } from "../firebase/firebase";

let authPromise: Promise<User> | null = null;

function waitForFirstAuthState(): Promise<User | null> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
}

async function waitForRestoredUser(): Promise<User | null> {
  const authWithReady = auth as typeof auth & {
    authStateReady?: () => Promise<void>;
  };

  if (typeof authWithReady.authStateReady === "function") {
    await authWithReady.authStateReady();
    return auth.currentUser;
  }

  return waitForFirstAuthState();
}

export async function getAnonymousUser(): Promise<User> {
  if (auth.currentUser) {
    console.log("[auth] using current user", {
      uid: auth.currentUser.uid,
      isAnonymous: auth.currentUser.isAnonymous
    });
    return auth.currentUser;
  }

  if (!authPromise) {
    authPromise = (async () => {
      const restoredUser = await waitForRestoredUser();

      if (restoredUser) {
        console.log("[auth] restored user", {
          uid: restoredUser.uid,
          isAnonymous: restoredUser.isAnonymous
        });
        return restoredUser;
      }

      const credential = await signInAnonymously(auth);
      console.log("[auth] signed in anonymously", {
        uid: credential.user.uid,
        isAnonymous: credential.user.isAnonymous
      });
      return credential.user;
    })();
  }

  try {
    return await authPromise;
  } finally {
    authPromise = null;
  }
}

export async function getAuthContext(): Promise<{ uid: string; token: string }> {
  const user = await getAnonymousUser();
  const token = await user.getIdToken();

  console.log("[auth] ID token ready", {
    uid: user.uid,
    isAnonymous: user.isAnonymous
  });

  return {
    uid: user.uid,
    token
  };
}

export async function getIdToken(): Promise<string> {
  const { token } = await getAuthContext();
  return token;
}
