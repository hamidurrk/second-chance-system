import Layout from "@/components/Layout";
import { useUser } from "@/components/UserContext";

export default function Home() {
      // console.log(useUser().user);
  return <Layout>
    <div className="text-primary flex justify-between">
      <h2>
        Hello, <b>{useUser().user?.name}</b>
      </h2>
      {/* <div className="flex bg-gray-300 gap-1 text-black rounded-lg overflow-hidden">
        <img src={session?.user?.image} alt="" className="w-6 h-6"/>
        <span className="px-2">
          {session?.user?.name}
        </span>
      </div> */}
    </div>
  </Layout>
}
