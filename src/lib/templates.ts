// Content templates for quick start

export interface Template {
  id: string
  name: string
  description: string
  category: string
  content: string
  icon: string
}

export const templates: Template[] = [
  {
    id: 'blog-post',
    name: 'Blog Post',
    description: 'Standard blog post template',
    category: 'Article',
    icon: '📝',
    content: `# Your Blog Post Title

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

*Thanks for reading! Share your thoughts in the comments.*`
  },
  
  {
    id: 'wechat-article',
    name: 'WeChat Article',
    description: 'Optimized for WeChat公众号',
    category: 'WeChat',
    icon: '💬',
    content: `# 标题：吸引人的文章标题

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

**关注我们获取更多精彩内容！**`
  },
  
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Announce a new product',
    category: 'Marketing',
    icon: '🚀',
    content: `# Introducing [Product Name]

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

[Sign up now](#) and get 30 days free!`
  },
  
  {
    id: 'tutorial',
    name: 'Tutorial Guide',
    description: 'Step-by-step tutorial',
    category: 'Education',
    icon: '📚',
    content: `# How to [Task Name]: A Complete Guide

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
- Join our community`
  },
  
  {
    id: 'company-timeline',
    name: 'Company Timeline',
    description: 'Company history and milestones',
    category: 'Corporate',
    icon: '🏢',
    content: `# Our Journey

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

We're just getting started...`
  },
  
  {
    id: 'event-announcement',
    name: 'Event Announcement',
    description: 'Promote an upcoming event',
    category: 'Marketing',
    icon: '🎉',
    content: `# Join Us for [Event Name]

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

[IMG: venue photo]`
  },
  
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Email newsletter template',
    category: 'Communication',
    icon: '📧',
    content: `# [Company] Newsletter - [Month Year]

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

*Thanks for reading! [Unsubscribe](#)*`
  },
  
  {
    id: 'case-study',
    name: 'Case Study',
    description: 'Customer success story',
    category: 'Marketing',
    icon: '📊',
    content: `# Case Study: How [Company] Achieved [Result]

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

Ready to achieve similar results? [Contact us](#)`
  }
]

export function getTemplate(id: string): Template | undefined {
  return templates.find(t => t.id === id)
}

export function getTemplatesByCategory(category: string): Template[] {
  return templates.filter(t => t.category === category)
}

export function getAllCategories(): string[] {
  return Array.from(new Set(templates.map(t => t.category)))
}
