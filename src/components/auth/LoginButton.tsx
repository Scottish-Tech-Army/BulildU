'use client'

import { useRouter } from "next/navigation";


export function LoginButton() {
  const router = useRouter();
  const signIn = async () => {
    router.push("/onboarding/baseline");
  }

  return (<button
    onClick={signIn}
    className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-md py-3 px-4 text-sm font-medium hover:bg-gray-100 transition"
  >
    <img
      src="/google.svg"
      alt="Google"
      className="w-5 h-5"
      loading="lazy"
    />
    Sign up with Google
  </button>)
}
