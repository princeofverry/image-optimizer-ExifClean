# ExifClean

**ExifClean** is a web-based privacy tool designed to **remove hidden metadata (EXIF)** from image files, including **GPS/location data**, camera information, and timestamps.  
This project is built as a **portfolio project** to demonstrate skills in web development, image processing, and digital privacy awareness.

---

## 🎯 Project Objectives

The main objectives of developing **ExifClean** are:

1. **Enhancing user privacy**
   - Remove GPS coordinates (latitude and longitude) that may expose the location where a photo was taken.
   - Eliminate camera-related metadata such as device model, brand, and capture time.

2. **Providing a simple and accessible privacy tool**
   - Users can upload an image and download a cleaned version without metadata.
   - No account, configuration, or technical knowledge required.

3. **Showcasing technical skills for portfolio purposes**
   - Demonstrate backend image processing using modern web technologies.
   - Show understanding of data privacy and security risks in digital media.
   - Serve as a foundation for more advanced image optimization or privacy tools.

4. **Supporting public and professional use cases**
   - Suitable for drone operators, journalists, researchers, and content creators who need to share images safely.

---

## 🚀 Project Goals & Planned Features

### Core Features (MVP)
- [x] Image upload (JPEG, PNG)
- [x] Complete EXIF metadata removal
- [x] GPS and location data stripping
- [x] Image re-encoding to prevent metadata recovery
- [x] Download cleaned image

### Functional Goals
- [ ] Metadata preview before and after cleaning
- [ ] Clear success status indicator (“Metadata Removed Successfully”)
- [ ] Multiple image upload support
- [ ] Drag-and-drop upload interface

### Advanced / Portfolio Goals
- [ ] Selective metadata removal (GPS only / full EXIF)
- [ ] Output format conversion (JPEG / WebP)
- [ ] File size comparison and optimization statistics
- [ ] Client-side image processing (privacy-first approach)
- [ ] API protection with rate limiting or signed URLs

---

## 🧩 Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Next.js Route Handlers (Node.js)
- **Image Processing**: Sharp
- **Language**: TypeScript
- **Deployment**: Vercel

---

## 🔐 Privacy Principles

ExifClean is built with the following privacy principles:
- **No data retention** – uploaded images are not stored permanently
- **No user tracking** – no metadata or personal data logging
- **Image re-encoding** to ensure metadata is fully removed and unrecoverable

---

## 📌 Use Cases

- Removing GPS data from drone photography
- Cleaning images before publishing on social media
- Securing research, documentation, or journalistic images
- Educational tool for digital privacy awareness

---

## 📈 Future Development

ExifClean can be extended into:
- Full image optimizer (resize, compress, WebP/AVIF)
- Privacy-focused image CDN
- SaaS-based photo security platform
- Supporting module for drone monitoring systems

---