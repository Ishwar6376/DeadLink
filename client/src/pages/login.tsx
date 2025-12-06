import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/clerk-react";
import Home from "./Home";

export default function Auth(){
    return(
    <div className="min-h-screen bg-slate-950 text-white">
      <main>
        <SignedOut>
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-slate-300 text-sm">Please sign in to use DeadLink</p>
            <RedirectToSignIn />
          </div>
        </SignedOut>
        
        <SignedIn>
          <Home />
        </SignedIn>
      </main>
    </div>
    )
}
