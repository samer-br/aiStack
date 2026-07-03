export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Citation {
  source: string;
  title: string;
  heading: string;
  text: string;
  score: number;
}
