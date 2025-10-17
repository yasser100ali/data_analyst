// "use client";

// import { Button } from "./ui/button";
// import { GitIcon } from "./icons";
// import Link from "next/link";

// export const Navbar = () => {
//   return (
//     <div className="p-2 flex flex-row gap-2 justify-between bg-background">
//       <Link href="https://github.com/vercel-labs/ai-sdk-preview-python-streaming">
//         <Button variant="outline">
//           <GitIcon /> View Source Code
//         </Button>
//       </Link>
//     </div>
//   );
// };

"use client";

import { Button } from "./ui/button";
import { GitIcon, VercelIcon } from "./icons";
import Link from "next/link";

export const Navbar = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="p-2 flex flex-row gap-2 justify-between">
      <Link href="https://github.com/yasser100ali/data_analyst">
        <Button variant="outline">
          <GitIcon /> View Source Code
        </Button>
      </Link>

      <Button variant="outline" onClick={handleRefresh}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="mr-2"
        >
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
        </svg>
        Refresh
      </Button>
    </div>
  );
};
