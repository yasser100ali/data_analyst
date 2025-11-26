import type { Attachment } from "ai";

import { LoaderIcon } from "./icons";
import { FileText, FileSpreadsheet, File } from "lucide-react";

const getFileIcon = (contentType: string | undefined, name: string | undefined) => {
  if (!contentType && !name) return File;
  
  // Check by content type
  if (contentType?.includes("pdf")) return FileText;
  if (contentType?.includes("csv") || contentType?.includes("spreadsheet") || contentType?.includes("excel")) {
    return FileSpreadsheet;
  }
  
  // Check by file extension
  const ext = name?.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return FileText;
  if (["csv", "xlsx", "xls"].includes(ext || "")) return FileSpreadsheet;
  
  return File;
};

const getFileType = (contentType: string | undefined, name: string | undefined): string => {
  if (!contentType && !name) return "FILE";
  
  // Check by content type first
  if (contentType?.includes("pdf")) return "PDF";
  if (contentType?.includes("csv")) return "CSV";
  if (contentType?.includes("spreadsheet") || contentType?.includes("excel")) {
    const ext = name?.split(".").pop()?.toUpperCase();
    if (ext === "XLSX" || ext === "XLS") return ext;
    return "EXCEL";
  }
  if (contentType?.includes("text/plain")) return "TXT";
  
  // Fallback to file extension
  const ext = name?.split(".").pop()?.toUpperCase();
  return ext || "FILE";
};

const getFileColor = (contentType: string | undefined, name: string | undefined): string => {
  const fileType = getFileType(contentType, name);
  
  // Green for spreadsheets (CSV, Excel)
  if (["CSV", "XLSX", "XLS", "EXCEL"].includes(fileType)) {
    return "text-green-600 dark:text-green-500";
  }
  
  // Red for PDFs
  if (fileType === "PDF") {
    return "text-red-600 dark:text-red-500";
  }
  
  // Blue for everything else
  return "text-blue-600 dark:text-blue-500";
};

const getBadgeColor = (contentType: string | undefined, name: string | undefined): string => {
  const fileType = getFileType(contentType, name);
  
  // Green for spreadsheets
  if (["CSV", "XLSX", "XLS", "EXCEL"].includes(fileType)) {
    return "bg-green-600 dark:bg-green-500";
  }
  
  // Red for PDFs
  if (fileType === "PDF") {
    return "bg-red-600 dark:bg-red-500";
  }
  
  // Blue for everything else
  return "bg-blue-600 dark:bg-blue-500";
};

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
}: {
  attachment: Attachment;
  isUploading?: boolean;
}) => {
  const { name, url, contentType } = attachment;
  const FileIcon = getFileIcon(contentType, name);
  const fileType = getFileType(contentType, name);
  const fileColor = getFileColor(contentType, name);
  const badgeColor = getBadgeColor(contentType, name);

  return (
    <div className="flex flex-col gap-1.5 max-w-[200px]">
      <div className="relative bg-muted/50 border border-border rounded-lg p-3 hover:bg-muted/80 transition-colors">
        {contentType?.startsWith("image") ? (
          // NOTE: it is recommended to use next/image for images
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={url}
            src={url}
            alt={name ?? "An image attachment"}
            className="rounded-md w-full h-24 object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-2">
            <div className="relative">
              <FileIcon className={`w-10 h-10 ${fileColor}`} strokeWidth={1.5} />
              <div className={`absolute -bottom-1 -right-1 ${badgeColor} text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-sm shadow-sm`}>
                {fileType}
              </div>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
            <div className="animate-spin text-primary">
              <LoaderIcon />
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-1 w-full">
        <div className="text-xs font-medium text-black break-words line-clamp-2" title={name}>
          {name}
        </div>
      </div>
    </div>
  );
};
