
import { useQuery } from "@tanstack/react-query";
import { getDocuments } from "@/api/requests";

export const useDocuments = () => {
  return useQuery<any[]>({
    queryKey: ["documents"],
    queryFn: getDocuments,
  });
};
