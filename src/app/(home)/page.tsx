import Link from "next/link";

import { Button } from "#/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <p className="font-handwriting text-6xl">Get started with your year on buffer!</p>
      <Button
        render={
          <Link href="/api/auth/buffer" aria-label="Link your buffer account to get started!" />
        }
        nativeButton={false}
      >
        Link up your account
      </Button>
    </div>
  );
}
