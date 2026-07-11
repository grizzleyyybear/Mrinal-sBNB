"use client";

import { BadgeCheck, ShieldCheck } from "lucide-react";
import Image from "next/image";
import type { User } from "@/types/api";

type HostCardProps = {
  host: User;
};

export function HostCard({ host }: HostCardProps) {
  return (
    <section className="border-b border-hairline-soft py-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-surface-strong">
            <Image src={host.avatar_url} alt={host.name} fill sizes="80px" className="object-cover" />
          </div>
          <div>
            <p className="text-[21px] font-semibold text-ink">Hosted by {host.name}</p>
            <p className="mt-1 text-sm text-muted">{host.is_superhost ? "Superhost · Fast response rate" : "Host · Verified profile"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-ink sm:min-w-[220px]">
          <div className="flex items-center gap-2">
            <BadgeCheck size={18} />
            <span>{host.is_superhost ? "Superhost" : "Verified"}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} />
            <span>Identity checked</span>
          </div>
        </div>
      </div>
    </section>
  );
}
