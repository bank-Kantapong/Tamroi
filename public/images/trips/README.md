# โครงสร้างการจัดเก็บรูปภาพของทริป (Trip Images Structure)

โฟลเดอร์นี้จัดเก็บรูปภาพทั้งหมดของแต่ละทริป โดยแยกตามโฟลเดอร์ที่เป็น **trip slug** เพื่อให้ง่ายต่อการนำรูปภาพจริงเข้ามาใส่แทนที่

```
public/images/trips/
  └── [trip-slug]/
      ├── cover.jpg (หรือ .png, .webp, .svg)
      └── stops/
          ├── 01-[stop-name].jpg
          ├── 02-[stop-name].jpg
          └── ...
```

## วิธีนำรูปจริงเข้ามาใส่แทนที่ (How to Replace with Real Photos)
1. เข้าไปที่โฟลเดอร์ของทริปที่ต้องการ เช่น `public/images/trips/hua-lamphong-chinatown-walk/`
2. **รูปภาพหน้าปกทริป (Cover Photo)**:
   - นำไฟล์รูปจริงมาวางแทนที่ไฟล์ `cover.svg` (หรือบันทึกเป็น `cover.jpg`, `cover.webp`, `cover.png`)
   - หากเปลี่ยนนามสกุล สามารถอัปเดตในระบบ Admin ที่ช่องรูปภาพหน้าปก หรือแก้ path ใน database ให้ตรงกัน
3. **รูปภาพจุดแวะ (Stop Photos)**:
   - วางรูปในโฟลเดอร์ `stops/` ตามลำดับหมายเลขจุดแวะ เช่น `01-hua-lamphong-station.jpg`, `02-wat-traimit.jpg`
4. **รองรับหลายรูปภาพต่อ 1 จุดแวะ (Carousel)**:
   - ในระบบ Admin ช่องรูปภาพของจุดแวะ สามารถใส่หลาย URL โดยคั่นด้วยเครื่องหมายจุลภาค (`,`) หรือขึ้นบรรทัดใหม่ เช่น:
     ```text
     /images/trips/hua-lamphong-chinatown-walk/stops/01-hua-lamphong-station-1.jpg
     /images/trips/hua-lamphong-chinatown-walk/stops/01-hua-lamphong-station-2.jpg
     ```

