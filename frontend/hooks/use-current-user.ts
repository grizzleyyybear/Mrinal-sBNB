"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_USER_ID, readCurrentUserId, writeCurrentUserId } from "@/lib/current-user";
import { switchUser } from "@/lib/api";
import type { User } from "@/types/api";

export function useCurrentUser(users: User[] | undefined) {
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState(() => readCurrentUserId());

  useEffect(() => {
    writeCurrentUserId(currentUserId);
  }, [currentUserId]);

  const currentUser = useMemo(() => {
    return users?.find((user) => user.id === currentUserId) ?? users?.find((user) => !user.is_host) ?? users?.[0];
  }, [currentUserId, users]);

  function selectUser(userId: number) {
    setCurrentUserId(userId);
    writeCurrentUserId(userId);
    switchUser(userId).catch(() => {
      // The header-based mock auth still works if the cookie write request fails.
    });
    queryClient.invalidateQueries();
  }

  return {
    currentUser,
    currentUserId: currentUser?.id ?? currentUserId,
    selectUser
  };
}
