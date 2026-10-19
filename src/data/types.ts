export interface ContactItem {
  label: string;
  href?: string;
  icon: string;
  text: string;
  isExternal?: boolean;
}

export interface ProfileInfo {
  name: string;
  englishName: string;
  bio: string;
  contacts: ContactItem[];
}

export interface EducationItem {
  school: string;
  degree: string;
  period: string;
  major: string;
  honorOrGpa: string;
}

export interface ProjectItem {
  title: string;
  tag?: string;
  period: string;
  description: string;
}

export interface SkillCategory {
  title: string;
  icon: string;
  skills: string[];
}

export interface AwardItem {
  name: string;
  date: string;
}

export interface TimelineItem {
  date: string;
  text: string;
}

export interface SiteProfile {
  profile: ProfileInfo;
  education: EducationItem[];
  projects: ProjectItem[];
  skills: SkillCategory[];
  awards: AwardItem[];
  timeline: TimelineItem[];
  footer: {
    note: string;
  };
}
