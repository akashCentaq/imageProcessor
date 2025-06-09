export interface ProcessingHistoryItem {
  id: string;
  date: string;
  name: string;
  imageCount: number;
  services: string[];
  status: "completed" | "failed";
  downloadUrl?: string;
  thumbnailUrl: string;
  creditsUsed: number;
}

export const PROCESSING_HISTORY: ProcessingHistoryItem[] = [
  {
    id: "job_20230615",
    date: "2023-06-15T10:30:00Z",
    name: "Portrait Session June",
    imageCount: 12,
    services: ["Background Replacement", "Skin Smoothing"],
    status: "completed",
    downloadUrl: "#",
    thumbnailUrl: "https://picsum.photos/seed/portrait1/100/100",
    creditsUsed: 24,
  },
  {
    id: "job_20230610",
    date: "2023-06-10T16:20:00Z",
    name: "Product Photos Batch",
    imageCount: 8,
    services: ["Color Correction", "Crop & Resize"],
    status: "completed",
    downloadUrl: "#",
    thumbnailUrl: "https://picsum.photos/seed/product1/100/100",
    creditsUsed: 16,
  },
  {
    id: "job_20230605",
    date: "2023-06-05T13:40:00Z",
    name: "Wedding Album",
    imageCount: 15,
    services: ["Advanced Retouching", "Stray Hair Removal"],
    status: "completed",
    downloadUrl: "#",
    thumbnailUrl: "https://picsum.photos/seed/wedding1/100/100",
    creditsUsed: 45,
  },
  {
    id: "job_20230528",
    date: "2023-05-28T09:15:00Z",
    name: "Vacation Photos",
    imageCount: 6,
    services: ["Color Correction"],
    status: "completed",
    downloadUrl: "#",
    thumbnailUrl: "https://picsum.photos/seed/vacation1/100/100",
    creditsUsed: 6,
  },
  {
    id: "job_20230522",
    date: "2023-05-22T14:45:00Z",
    name: "Real Estate Listing",
    imageCount: 10,
    services: ["Color Correction", "Advanced Retouching"],
    status: "completed",
    downloadUrl: "#",
    thumbnailUrl: "https://picsum.photos/seed/realestate1/100/100",
    creditsUsed: 30,
  },
  {
    id: "job_20230518",
    date: "2023-05-18T11:05:00Z",
    name: "Headshot Session",
    imageCount: 4,
    services: [
      "Background Replacement",
      "Skin Smoothing",
      "Stray Hair Removal",
    ],

    status: "completed",
    downloadUrl: "#",
    thumbnailUrl: "https://picsum.photos/seed/headshot1/100/100",
    creditsUsed: 16,
  },
  {
    id: "job_20230512",
    date: "2023-05-12T15:30:00Z",
    name: "Family Portraits",
    imageCount: 9,
    services: ["Skin Smoothing", "Color Correction"],
    status: "failed",
    thumbnailUrl: "https://picsum.photos/seed/family1/100/100",
    creditsUsed: 0,
  },
  {
    id: "job_20230505",
    date: "2023-05-05T08:20:00Z",
    name: "Pet Photography",
    imageCount: 7,
    services: ["Background Replacement", "Color Correction"],
    status: "completed",
    downloadUrl: "#",
    thumbnailUrl: "https://picsum.photos/seed/pet1/100/100",
    creditsUsed: 14,
  },
];
