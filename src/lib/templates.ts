// Content templates for quick start
import type { Language } from "@/hooks/useTranslation";

export interface Template {
  id: string;
  nameKey: string; // Translation key, e.g., 'templates.blogPost'
  descriptionKey: string; // Translation key, e.g., 'templates.blogPostDesc'
  category: string;
  icon: string;
  content: Record<Language, string>; // { en: '...', zh: '...' }
}

export const templates: Template[] = [
  {
    id: "blog-post",
    nameKey: "templates.blogPost",
    descriptionKey: "templates.blogPostDesc",
    category: "Article",
    icon: "📝",
    content: {
      en: `# Your Blog Post Title

*Published on ${new Date().toLocaleDateString()}*

## Introduction

Start with a compelling introduction that hooks your readers...

## Main Content

### Key Point 1

Explain your first main point with details and examples.

### Key Point 2

Continue with your second point.

### Key Point 3

Wrap up with your final point.

## Conclusion

Summarize your key takeaways and provide a call to action.

---

*Thanks for reading! Share your thoughts in the comments.*`,
      zh: `# 您的博客文章标题

*发布于 ${new Date().toLocaleDateString()}*

## 引言

用一个引人入胜的开头吸引读者...

## 主要内容

### 要点 1

用细节和示例解释你的第一个要点。

### 要点 2

继续你的第二个要点。

### 要点 3

总结你的最终要点。

## 结论

总结你的关键收获并提供行动号召。

---

*感谢阅读！在评论区分享您的想法。*`,
    },
  },

  {
    id: "wechat-article",
    nameKey: "templates.wechatArticle",
    descriptionKey: "templates.wechatArticleDesc",
    category: "WeChat",
    icon: "💬",
    content: {
      en: `# Title: Catchy Article Title

:::hero
## Introduction
Capture your readers' attention with an engaging opening
:::

## Main Content

### Part 1

Detailed content...

[IMG: Image description]

### Part 2

Continue your content...

:::card
💡 **Tips**
Important tips or information
:::

## Summary

Summarize the key points

---

**Follow us for more great content!**`,
      zh: `# 标题：吸引人的文章标题

:::hero
## 引言
用一段话吸引读者注意力
:::

## 正文内容

### 第一部分

详细内容...

[IMG: 配图描述]

### 第二部分

继续你的内容...

:::card
💡 **小贴士**
重要的提示信息
:::

## 总结

总结全文要点

---

**关注我们获取更多精彩内容！**`,
    },
  },

  {
    id: "product-launch",
    nameKey: "templates.productLaunch",
    descriptionKey: "templates.productLaunchDesc",
    category: "Marketing",
    icon: "🚀",
    content: {
      en: `# Introducing [Product Name]

:::hero
## The Future of [Category] is Here
Experience innovation like never before
:::

## What is [Product Name]?

[Product Name] is a revolutionary solution that...

:::col-2
### Key Feature 1
Description of feature 1
---
### Key Feature 2
Description of feature 2
:::

:::col-2
### Key Feature 3
Description of feature 3
---
### Key Feature 4
Description of feature 4
:::

## How It Works

:::steps
1. Step One
   Easy setup in minutes

2. Step Two
   Configure to your needs

3. Step Three
   Start seeing results
:::

## Pricing

:::card
### Starter Plan
$9/month
- Feature A
- Feature B
- Feature C
:::

## Get Started Today

[Sign up now](#) and get 30 days free!`,
      zh: `# 介绍 [产品名称]

:::hero
## [类别]的未来已来
前所未有的创新体验
:::

## [产品名称]是什么？

[产品名称]是一款革命性的解决方案...

:::col-2
### 核心功能 1
功能 1 的描述
---
### 核心功能 2
功能 2 的描述
:::

:::col-2
### 核心功能 3
功能 3 的描述
---
### 核心功能 4
功能 4 的描述
:::

## 工作原理

:::steps
1. 第一步
   几分钟轻松设置

2. 第二步
   根据需要配置

3. 第三步
   开始看到效果
:::

## 价格方案

:::card
### 入门版
¥68/月
- 功能 A
- 功能 B
- 功能 C
:::

## 立即开始

[立即注册](#) 并获得 30 天免费试用！`,
    },
  },

  {
    id: "tutorial",
    nameKey: "templates.tutorial",
    descriptionKey: "templates.tutorialDesc",
    category: "Education",
    icon: "📚",
    content: {
      en: `# How to [Task Name]: A Complete Guide

## What You'll Learn

In this tutorial, you'll learn how to:
- Point 1
- Point 2
- Point 3

## Prerequisites

Before starting, make sure you have:
- Requirement 1
- Requirement 2

## Step-by-Step Instructions

:::steps
1. First Step
   Detailed instructions for step 1
   
   \`\`\`bash
   # Example command
   npm install package
   \`\`\`

2. Second Step
   Instructions for step 2

3. Third Step
   Instructions for step 3
:::

## Common Issues

:::card
### Problem 1
**Solution:** How to fix it
:::

:::card
### Problem 2
**Solution:** How to fix it
:::

## Conclusion

You've successfully learned how to [task]!

## Next Steps

- Try [related task]
- Explore [advanced topic]
- Join our community`,
      zh: `# 如何 [任务名称]：完整指南

## 您将学到什么

在本教程中，您将学习如何：
- 要点 1
- 要点 2
- 要点 3

## 前提条件

开始之前，请确保您有：
- 前提条件 1
- 前提条件 2

## 分步说明

:::steps
1. 第一步
   第一步的详细说明
   
   \`\`\`bash
   # 示例命令
   npm install package
   \`\`\`

2. 第二步
   第二步的说明

3. 第三步
   第三步的说明
:::

## 常见问题

:::card
### 问题 1
**解决方案：** 如何修复
:::

:::card
### 问题 2
**解决方案：** 如何修复
:::

## 结论

您已成功学习如何 [任务]！

## 下一步

- 尝试 [相关任务]
- 探索 [高级主题]
- 加入我们的社区`,
    },
  },

  {
    id: "company-timeline",
    nameKey: "templates.companyTimeline",
    descriptionKey: "templates.companyTimelineDesc",
    category: "Corporate",
    icon: "🏢",
    content: {
      en: `# Our Journey

## The Story of [Company Name]

:::timeline
2020 - Founded
Started with a vision to change [industry]
---
2021 - First Product
Launched our flagship product
---
2022 - Series A
Raised $10M to expand our team
---
2023 - Global Expansion
Opened offices in 5 countries
---
2024 - Market Leader
Became the #1 solution in our category
:::

## What's Next

We're just getting started...`,
      zh: `# 我们的历程

## [公司名称]的故事

:::timeline
2020 - 创立
带着改变 [行业] 的愿景起步
---
2021 - 首款产品
推出我们的旗舰产品
---
2022 - A轮融资
融资 1000 万美元扩展团队
---
2023 - 全球扩张
在 5 个国家开设办公室
---
2024 - 市场领先
成为该领域的 #1 解决方案
:::

## 未来展望

我们才刚刚开始...`,
    },
  },

  {
    id: "event-announcement",
    nameKey: "templates.eventAnnouncement",
    descriptionKey: "templates.eventAnnouncementDesc",
    category: "Marketing",
    icon: "🎉",
    content: {
      en: `# Join Us for [Event Name]

:::hero
## [Date] | [Location]
The premier event for [industry]
:::

## About the Event

[Event Name] brings together...

## What to Expect

:::col-3
### Keynote Speakers
Industry leaders sharing insights
---
### Networking
Connect with peers
---
### Workshops
Hands-on learning sessions
:::

## Schedule

:::timeline
9:00 AM - Registration
Coffee and networking
---
10:00 AM - Opening Keynote
[Speaker Name]
---
12:00 PM - Lunch Break
Networking lunch
---
2:00 PM - Workshops
Choose your track
---
5:00 PM - Closing Reception
Celebrate and connect
:::

## Register Now

:::card
### Early Bird Special
**$99** (Regular: $199)

[Register Now](#)
:::

## Location

[Venue Name]
[Address]

[IMG: venue photo]`,
      zh: `# 邀请参加 [活动名称]

:::hero
## [日期] | [地点]
[行业] 顶级盛会
:::

## 关于活动

[活动名称] 汇聚了...

## 精彩内容

:::col-3
### 主题演讲
行业领袖分享见解
---
### 交流环节
与同行建立联系
---
### 工作坊
动手实践学习
:::

## 活动日程

:::timeline
9:00 - 签到
咖啡与社交
---
10:00 - 开场演讲
[演讲者姓名]
---
12:00 - 午餐休息
社交午餐
---
14:00 - 工作坊
选择您的场次
---
17:00 - 闭幕酒会
庆祝与交流
:::

## 立即报名

:::card
### 早鸟优惠
**¥699**（原价: ¥1299）

[立即报名](#)
:::

## 活动地点

[场地名称]
[地址]

[IMG: 场地照片]`,
    },
  },

  {
    id: "newsletter",
    nameKey: "templates.newsletter",
    descriptionKey: "templates.newsletterDesc",
    category: "Communication",
    icon: "📧",
    content: {
      en: `# [Company] Newsletter - [Month Year]

## This Month's Highlights

### 🎯 Feature Story

[Main story headline]

Brief description...

[Read More](#)

---

### 📰 News & Updates

:::col-2
#### Update 1
Brief description
---
#### Update 2
Brief description
:::

---

### 💡 Tips & Tricks

:::card
**Pro Tip:** [Useful tip for your audience]
:::

---

### 📅 Upcoming Events

- **[Date]** - [Event Name]
- **[Date]** - [Event Name]

---

### 🌟 Community Spotlight

Featuring [Person/Company]...

---

*Thanks for reading! [Unsubscribe](#)*`,
      zh: `# [公司] Newsletter - [月份年份]

## 本月精选

### 🎯 专题报道

[主要故事标题]

简要描述...

[阅读更多](#)

---

### 📰 新闻与更新

:::col-2
#### 更新 1
简要描述
---
#### 更新 2
简要描述
:::

---

### 💡 技巧与窍门

:::card
**实用技巧：** [为您的受众提供的实用技巧]
:::

---

### 📅 即将到来的活动

- **[日期]** - [活动名称]
- **[日期]** - [活动名称]

---

### 🌟 社区聚焦

聚焦 [人物/公司]...

---

*感谢阅读！[取消订阅](#)*`,
    },
  },

  {
    id: "case-study",
    nameKey: "templates.caseStudy",
    descriptionKey: "templates.caseStudyDesc",
    category: "Marketing",
    icon: "📊",
    content: {
      en: `# Case Study: How [Company] Achieved [Result]

## Executive Summary

[Company] used [Your Product] to achieve [impressive result].

:::card
### Key Results
- 📈 [Metric] increased by [X]%
- ⏱️ [Metric] reduced by [X]%
- 💰 [Metric] improved by [X]%
:::

## The Challenge

[Company] was facing...

## The Solution

:::steps
1. Discovery Phase
   We analyzed their needs

2. Implementation
   Rolled out our solution

3. Optimization
   Fine-tuned for maximum impact
:::

## The Results

:::col-2
### Before
- Problem 1
- Problem 2
- Problem 3
---
### After
- Solution 1
- Solution 2
- Solution 3
:::

## Client Testimonial

> "[Quote from client about their experience]"
> 
> — [Name], [Title] at [Company]

## Conclusion

Ready to achieve similar results? [Contact us](#)`,
      zh: `# 案例研究：[公司] 如何达成 [成果]

## 执行摘要

[公司] 使用 [您的产品] 达成了 [令人瞩目的成果]。

:::card
### 关键成果
- 📈 [指标] 提升了 [X]%
- ⏱️ [指标] 减少了 [X]%
- 💰 [指标] 改善了 [X]%
:::

## 面临的挑战

[公司] 当时面临...

## 解决方案

:::steps
1. 发现阶段
   我们分析了他们的需求

2. 实施阶段
   推出我们的解决方案

3. 优化阶段
   微调以达到最大效果
:::

## 成果

:::col-2
### 之前
- 问题 1
- 问题 2
- 问题 3
---
### 之后
- 解决方案 1
- 解决方案 2
- 解决方案 3
:::

## 客户评价

> "[关于客户体验的引言]"
> 
> — [姓名]，[公司] [职位]

## 结论

准备好取得类似成果了吗？[联系我们](#)`,
    },
  },
];

export function getTemplate(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): Template[] {
  return templates.filter((t) => t.category === category);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(templates.map((t) => t.category)));
}
