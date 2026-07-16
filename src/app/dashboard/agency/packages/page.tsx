import AgencyPackagesManager from "@/Components/agency/AgencyPacagePostPage";
import { getUserToken } from "@/lib/session";

export default async function PostPage() {
  const token = await getUserToken();
  return <AgencyPackagesManager token={token}/>;
}