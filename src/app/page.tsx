import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSuggestedQuestions } from "@/lib/retrieval";
import { SignInScreen } from "@/components/SignInScreen";
import { ChatApp } from "@/components/ChatApp";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return <SignInScreen />;
  }

  return (
    <ChatApp
      userName={session.user.name ?? session.user.email ?? "there"}
      userImage={session.user.image ?? null}
      suggestedQuestions={getSuggestedQuestions()}
    />
  );
}
