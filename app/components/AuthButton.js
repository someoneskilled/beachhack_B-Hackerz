"use client"; // Ensures this runs on the client side

import { UserButton, SignUpButton, useUser } from "@clerk/nextjs";

const AuthButton = () => {
  const { isSignedIn } = useUser();

  return isSignedIn ? <UserButton /> : <SignUpButton />;
};

export default AuthButton;
