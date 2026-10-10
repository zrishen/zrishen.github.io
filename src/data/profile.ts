import type { SiteProfile } from './types';

export const siteData: SiteProfile = {
  profile: {
    name: "钟日深",
    englishName: "zrishen",
    title: "算法工程师",
    titleIcon: "fa-solid fa-briefcase",
    bio: "华南师范大学硕士，研究方向涵盖计算机视觉（CV）、多模态表征对齐与大语言模型工程落地。",
    contacts: [
      {
        label: "邮箱",
        href: "mailto:rishenz@163.com",
        icon: "fa-regular fa-envelope",
        text: "rishenz@163.com"
      },
      {
        label: "GitHub",
        href: "https://github.com/zrishen",
        icon: "fa-brands fa-github",
        text: "GitHub",
        isExternal: true
      },
      {
        label: "电话",
        icon: "fa-solid fa-phone",
        text: "15605939608"
      }
    ]
  },
  education: [
    {
      school: "华南师范大学 · 硕士",
      degree: "硕士",
      period: "2023.09 - 2026.06",
      major: "人工智能",
      honorOrGpa: "绩点 3.73 / 4.00"
    },
    {
      school: "福建农林大学 · 学士",
      degree: "学士",
      period: "2019.09 - 2023.06",
      major: "计算机科学与技术",
      honorOrGpa: "专业排名 7 / 120"
    }
  ],
  projects: [
    {
      title: "基于图像监控与边缘计算的水稻病虫害自动识别",
      tag: "国家级大创·优秀结题",
      period: "2021.06 - 2022.12",
      description: "面向水稻病虫害的图像识别与远程监测系统，以解耦知识蒸馏提升轻量模型精度 8.48%，并完成 Django 后端与边缘设备部署。获软件著作权 2 项（《基于知识蒸馏的水稻病虫害图像识别软件》《水稻病虫害图像识别边缘计算系统》）。"
    }
  ],
  skills: [
    {
      title: "计算机视觉",
      icon: "fa-solid fa-eye",
      skills: ["CNN", "Faster R-CNN", "SSD", "ViT", "PyTorch", "OpenCV", "Pillow"]
    },
    {
      title: "多模态学习",
      icon: "fa-solid fa-diagram-project",
      skills: ["BERT", "CLIP", "BLIP", "跨模态特征对齐", "提示学习"]
    },
    {
      title: "大语言模型",
      icon: "fa-solid fa-brain",
      skills: ["Qwen2.5", "DeepSeek 原理与前沿技术学习"]
    },
    {
      title: "开发与部署",
      icon: "fa-solid fa-code",
      skills: ["C/C++", "Python", "Linux", "Git", "Docker", "Django"]
    }
  ],
  awards: [
    {
      name: "蓝桥杯 C/C++ 程序设计全国总决赛三等奖、省一等奖",
      date: "2021.06"
    },
    {
      name: "ASC 世界大学生超级计算机竞赛二等奖",
      date: "2022.03"
    },
    {
      name: "全国大学生数学建模竞赛福建赛区一等奖（前 6.6%）",
      date: "2022.11"
    },
    {
      name: "泛珠三角大学生计算机作品赛总决赛一等奖",
      date: "2023.03"
    },
    {
      name: "全国大学生物联网设计竞赛（华为杯）华东赛区二等奖",
      date: "2022.08"
    }
  ],
  footer: {
    year: 2026,
    copyright: "© 2026 钟日深 (Rishen Zhong). Hosted on GitHub Pages."
  }
};
