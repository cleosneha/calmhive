import { IconType } from "react-icons";

export interface GuideSubItem {
  title: string;
  description: string;
  steps: string[];
}

export interface GuideSection {
  id: string;
  title: string;
  icon: IconType;
  color: string;
  description: string;
  items: GuideSubItem[];
}
