# Smart Card Image System Documentation

This document explains how to use the smart card image system for blog posts on your website.

## Overview

The smart card image system provides an easy way to add images to blog cards without modifying CSS files. There are two ways to specify images for blog cards:

1. Using `data-image` attribute on the blog card (recommended)
2. Using a CSS variable via a style attribute on the blog image div

## Method 1: Using data-image attribute (Recommended)

This method is the simplest and most maintainable. Add a `data-image` attribute to the blog card element with the path to the image:

```html
<article class="blog-card" data-category="android mobile" data-image="images/your-image.jpg">
    <div class="blog-image"></div>
    <div class="blog-content">
        <span class="blog-category">Android Security</span>
        <h3>Your Blog Post Title</h3>
        <p>Your blog post description...</p>
        <a href="blog/your-post.html" class="read-more">Read More</a>
    </div>
</article>
```

The JavaScript will automatically apply the image to the `.blog-image` div using CSS variables.

## Method 2: Using style attribute with CSS variable

You can also directly set the CSS variable in the style attribute of the `.blog-image` div:

```html
<article class="blog-card" data-category="web web-security">
    <div class="blog-image" style="--card-image: url('images/your-image.jpg');"></div>
    <div class="blog-content">
        <span class="blog-category">Web Security</span>
        <h3>Your Blog Post Title</h3>
        <p>Your blog post description...</p>
        <a href="blog/your-post.html" class="read-more">Read More</a>
    </div>
</article>
```

## For Blog Post Headers

The blog post headers use a similar approach. In your blog post template, you can set the header image using a CSS variable:

```html
<section class="post-header" style="--post-image: url('../images/your-image.jpg');">
    <div class="container">
        <h1>Your Blog Post Title</h1>
    </div>
</section>
```

## Fallback Images

If no image is specified, the system will use fallback images based on the blog post's category:

- Web Security: `images/1.jpeg`
- Web3/Blockchain: `images/blockchain.jpg`
- Android: `images/android-security.jpeg`
- Web: `images/web.jpg`
- Default: `images/default.jpg`

## Image Guidelines

For best results:

1. Store all blog post images in the `images/` directory
2. Use JPEG, PNG, or WebP format for optimal performance
3. Recommended image dimensions: 800×450px (16:9 ratio)
4. Keep file sizes under 200KB for optimal loading times
5. Use descriptive filenames that relate to the blog post content 