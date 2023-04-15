import { useSession } from "next-auth/react"
import Image from "next/image";

const profile = () => {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    return <div>Please log in to see this page</div>;
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <Image src={session.user.image} alt="User Avatar" width={100} height={100} />
      <p>{session.user.name}</p>
      <p>{session.user.about}</p>
      <p>{session.user.birthday}</p>
      <p>{session.user.gender}</p>
      <p>{session.user.hometown}</p>
      <p>{session.user.languages}</p>
      <p>{session.user.location}</p>
    </div>
  );
}
export default profile