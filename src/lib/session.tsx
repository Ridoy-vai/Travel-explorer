import { headers } from "next/headers";
import { auth } from "./auth";

export const getUserToken = async (): Promise<string | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.session?.token ?? null;
};


// export const authheader = async () => {
//   const token = await getUserToken();
//   const headers = token ? {
//     authorization: `bearer ${token}`
//   } : {}
//   return headers
// }