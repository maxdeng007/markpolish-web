# AI Image Generation Setup Guide

## Overview

MarkPolish Studio v2.0 now includes AI-powered image generation using **ModelScope Z-Image-Turbo**, a state-of-the-art text-to-image model developed by Alibaba's Tongyi-MAI team.

## Features

- **Fast Generation**: Sub-second inference on enterprise GPUs, 5-15 seconds on free tier
- **High Quality**: 6B parameter model with photorealistic output
- **Bilingual Support**: Generates images from English and Chinese prompts
- **Free API**: Unlimited free generations with ModelScope (rate limits apply)
- **Multiple Sizes**: Square, Portrait, Landscape, and Wide presets

---

## Getting Your API Key

### Step 1: Register on ModelScope

1. Visit [https://modelscope.cn](https://modelscope.cn)
2. Click "Sign Up" or "注册" in the top right
3. Register with your email or GitHub account
4. Verify your email address

### Step 2: Generate API Token

1. Log in to your ModelScope account
2. Click on your profile icon in the top right
3. Navigate to "API Token" or "API令牌"
4. Click "Generate New Token" or "生成新令牌"
5. Copy the generated token (it looks like: `ms-xxxxxxxxxxxxxxxxxxxxx`)
6. **Important**: Save this token securely - you won't be able to see it again!

### Step 3: Add API Key to MarkPolish Studio

1. Open MarkPolish Studio
2. Click the **Images** tab in the left sidebar
3. Click the **AI Generate** sub-tab
4. You'll see an API Key configuration section
5. Paste your ModelScope API token
6. Click "Save API Key"

Your API key is stored locally in your browser and never sent anywhere except to ModelScope's API.

---

## How to Use

### Basic Usage

1. **Navigate to AI Generate**:
   - Click "Images" tab → "AI Generate" sub-tab

2. **Enter Your Prompt**:
   - Describe the image you want in the text area
   - Be specific and descriptive
   - Example: "A serene mountain lake at sunset with vibrant orange and purple sky, photorealistic"

3. **Choose Image Size**:
   - Square (1024×1024) - Default, best for most uses
   - Portrait (768×1024) - Vertical images
   - Landscape (1024×768) - Horizontal images
   - Wide (1536×768) - Ultra-wide images

4. **Generate**:
   - Click "Generate Image" button
   - Wait 5-15 seconds for generation
   - Progress updates will show in real-time

5. **Use Your Image**:
   - **Download**: Save to your computer
   - **Add to Library**: Save to your image library for reuse
   - **Insert into Editor**: Add directly to your markdown content

---

## Tips for Better Results

### Prompt Engineering

**Good Prompts**:
- ✅ "A young woman with long black hair sitting in a modern café, natural lighting, photorealistic, 4K quality"
- ✅ "Futuristic cityscape at night with neon signs in Chinese and English, cyberpunk style, detailed"
- ✅ "Golden retriever puppy playing in a sunlit park, shallow depth of field, professional photography"

**Poor Prompts**:
- ❌ "dog" (too vague)
- ❌ "nice picture" (not descriptive)
- ❌ "something cool" (unclear)

### Prompt Structure

Use this formula for best results:

```
[Subject] + [Action/Pose] + [Environment] + [Lighting] + [Style] + [Quality]
```

**Example**:
```
A professional businessman + standing confidently + in a modern office + 
natural window lighting + corporate photography style + high resolution
```

### Keywords That Work Well

**Style Keywords**:
- photorealistic, realistic, detailed
- artistic, painterly, illustration
- cinematic, dramatic
- minimalist, clean
- vintage, retro

**Quality Keywords**:
- 4K, 8K, high resolution
- professional photography
- detailed, intricate
- sharp focus
- high quality

**Lighting Keywords**:
- natural lighting, sunlight
- golden hour, sunset
- studio lighting
- dramatic lighting
- soft lighting, diffused

---

## API Limits & Pricing

### Free Tier (Current)

- **Cost**: FREE
- **Rate Limit**: ~50-100 generations per hour
- **Image Size**: Up to 1536×1536 pixels
- **Generation Time**: 5-15 seconds average
- **Quality**: Full quality, no degradation

### Rate Limit Handling

If you hit rate limits:
1. Wait 5-10 minutes for the limit to reset
2. Reduce generation frequency
3. Consider upgrading to ModelScope Pro (if available)

---

## Troubleshooting

### "API key not configured"

**Solution**: Add your ModelScope API key in the AI Generate tab.

### "API Error (401)"

**Cause**: Invalid or expired API key

**Solution**:
1. Generate a new API key from ModelScope
2. Update the key in MarkPolish Studio

### "API Error (429)"

**Cause**: Rate limit exceeded

**Solution**:
1. Wait 5-10 minutes
2. Reduce generation frequency

### "Generation timeout"

**Cause**: Server overload or network issues

**Solution**:
1. Try again in a few minutes
2. Check your internet connection
3. Try a simpler prompt

### "Generation failed"

**Possible Causes**:
- Prompt contains inappropriate content
- Server error
- Network issues

**Solution**:
1. Modify your prompt
2. Try again
3. Check ModelScope status page

---

## Technical Details

### Model Information

- **Model**: Z-Image-Turbo by Tongyi-MAI
- **Parameters**: 6 Billion
- **Architecture**: S³-DiT (Scalable Single-Stream Diffusion Transformer)
- **License**: Apache 2.0 (Open Source)
- **Inference Steps**: 9 (optimized for speed)
- **Guidance Scale**: 0.0 (Turbo mode)

### API Endpoints

- **Base URL**: `https://api-inference.modelscope.cn/v1`
- **Generation**: `POST /images/generations`
- **Status Check**: `GET /tasks/{task_id}`

### Security

- API keys are stored locally in browser localStorage
- Keys are never sent to any server except ModelScope
- HTTPS encryption for all API calls
- No data is logged or stored by MarkPolish Studio

---

## Examples

### Example 1: Product Photography

**Prompt**:
```
A sleek modern smartphone on a minimalist white desk, 
professional product photography, studio lighting, 
high resolution, commercial quality
```

**Size**: Square (1024×1024)

### Example 2: Nature Scene

**Prompt**:
```
A misty forest at dawn with sunlight filtering through trees, 
atmospheric, peaceful, nature photography, 
vibrant green colors, high detail
```

**Size**: Landscape (1024×768)

### Example 3: Portrait

**Prompt**:
```
Professional headshot of a confident businesswoman, 
modern office background, natural lighting, 
shallow depth of field, corporate photography
```

**Size**: Portrait (768×1024)

### Example 4: Illustration

**Prompt**:
```
Cute cartoon cat sitting on a stack of books, 
colorful illustration style, children's book art, 
warm colors, friendly expression
```

**Size**: Square (1024×1024)

---

## FAQ

### Q: Is the API really free?

**A**: Yes! ModelScope provides free access to Z-Image-Turbo with rate limits. You get 50-100 generations per hour at no cost.

### Q: Can I use generated images commercially?

**A**: Yes! Z-Image-Turbo is licensed under Apache 2.0, which allows commercial use. However, check ModelScope's terms of service for any additional restrictions.

### Q: How long does generation take?

**A**: Typically 5-15 seconds on the free tier. Enterprise GPUs can generate in under 1 second.

### Q: What languages are supported?

**A**: Both English and Chinese prompts work well. The model is bilingual.

### Q: Can I generate NSFW content?

**A**: No. ModelScope's API filters inappropriate content. Prompts violating content policies will fail.

### Q: What's the maximum image size?

**A**: The model supports up to 1536×1536 pixels. Larger sizes may cause quality degradation.

### Q: Can I fine-tune the model?

**A**: Not through this interface. For fine-tuning, you'd need to download the model and run it locally.

---

## Support

### Need Help?

- **ModelScope Documentation**: [https://modelscope.cn/docs](https://modelscope.cn/docs)
- **Z-Image-Turbo Model Page**: [https://modelscope.cn/models/Tongyi-MAI/Z-Image-Turbo](https://modelscope.cn/models/Tongyi-MAI/Z-Image-Turbo)
- **GitHub Issues**: Report bugs in MarkPolish Studio repository

### Community

- Join ModelScope community for tips and examples
- Share your generated images (with appropriate credits)
- Learn from other users' prompts

---

**Happy Creating!** 🎨✨
