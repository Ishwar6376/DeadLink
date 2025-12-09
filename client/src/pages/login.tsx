import {
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";
import Home from "./Home";
import { useEffect } from "react";
import axios from "axios";

interface UserData {
  name: string;
  email: string;
  userId: string;
}

export default function Auth() {
  const { user, isLoaded, isSignedIn } = useUser();

  
  const saveUser = async (userData: UserData) => {
    console.log("userData",userData);
    const res=await axios.post("/api/saveUser", userData);
    console.log(res);
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const newUser: UserData = {
      name: user?.fullName || "",
      email: user?.primaryEmailAddress?.emailAddress || "",
      userId: user?.id || "",
    };

    saveUser(newUser);
  }, [isLoaded, isSignedIn]); 

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main>
        <SignedOut>
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-slate-300 text-sm">Please sign in to use DeadLink</p>

            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-600 rounded-xl hover:bg-blue-700 transition">
                Sign In
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <Home />
        </SignedIn>
      </main>
    </div>
  );
}
