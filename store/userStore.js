import { user } from "@/components/Constants/apiEndpoints";
import { getRequest } from "@/config/axiosInterceptor";
import { getCookie } from "cookies-next";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const userDetailsStore = create(
  persist(
    (set) => ({
      userDetails: [],
      getUserDetails: async () => {
        try {
          const response = await getRequest({
            url: user,
            token: getCookie("token"),
          });
          const data = await response?.data;
          if (data) {
            return set(() => ({
              userDetails: data,
            }));
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
    {
      name: "user",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
