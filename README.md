# capstone_ck_nodejs
# Kiến Trúc Dự Án NestJS Chuẩn Doanh Nghiệp (Enterprise-grade NestJS Architecture)

Tài liệu này đề xuất kế hoạch kiến trúc và thiết kế cây thư mục chuẩn đã được **tinh gọn** cho dự án **capstone_ck_nodejs** theo yêu cầu của bạn (loại bỏ phần test, seed, và AWS S3). Dự án sẽ sử dụng **NestJS**, **Prisma (PostgreSQL/Supabase)**, **Redis**, **Docker**, **BullMQ**, và **Cloudinary** làm nền tảng lưu trữ chính.

---

## Ý Tưởng Phát Triển & Tính Năng Đột Phá Bổ Sung

Ngoài các thành phần cơ bản (Authentication, Validation, Config, Upload, Bcrypt, Queue, Docker, Prisma, Sockets, Postgres, Swagger, Logging, Deploy Railway, Supabase DB Cloud), tôi đề xuất thêm những **ý tưởng bổ sung cực kỳ quan trọng và cao cấp** để nâng tầm dự án này:

1. **Global API Response Interceptor**: Standardize mọi phản hồi từ API về một định dạng thống nhất (ví dụ: `success`, `statusCode`, `message`, `data`, `timestamp`). Việc này giúp Frontend (React/React Native/Vue) xử lý dữ liệu và lỗi cực kỳ mượt mà, chuyên nghiệp.
2. **Global Exception Filter cho Prisma & HTTP Errors**: Chuyển đổi tự động các lỗi hệ thống phức tạp (như lỗi trùng unique key của Prisma, lỗi khóa ngoại, lỗi không tìm thấy) thành lỗi HTTP thân thiện với Client (ví dụ: `409 Conflict`, `400 Bad Request`) để bảo mật thông tin DB và phản hồi rõ ràng.
3. **Prisma Soft Delete Extension (Xóa mềm)**: Tạo một extension hoặc middleware trong Prisma để tự động chuyển đổi các câu lệnh `delete` thành update trường `deletedAt`, và tự động lọc bỏ các bản ghi đã xóa khỏi mọi câu lệnh `findMany`, `findUnique`.
4. **API Versioning (Quản lý phiên bản API)**: Cấu hình Versioning toàn hệ thống ngay từ đầu (ví dụ: `/api/v1/users`, `/api/v2/users`) để dự án dễ bảo trì và nâng cấp không sợ breaking changes.
5. **Rate Limiting / Throttling (Chống Spam API)**: Sử dụng `@nestjs/throttler` kết hợp với Redis để giới hạn số lượng request từ một IP (ví dụ: tối đa 100 requests/phút cho các API thường, và 5 requests/phút cho API Login/OTP) nhằm chống tấn công Brute Force, DDOS.
6. **Mailer Service & Email Queue (Gửi email bất đồng bộ)**: Kết hợp **BullMQ**, **Redis**, và **Nodemailer/Handlebars** để tạo hàng đợi gửi email xác thực, đặt lại mật khẩu, thông báo. Email được render bằng template HTML động (`.hbs`) tuyệt đẹp, gửi ngầm giúp API phản hồi ngay lập tức không bị nghẽn.
7. **Health Checks / System Metrics**: Sử dụng NestJS Terminus (`@nestjs/terminus`) để tạo endpoint `/health` kiểm tra trạng thái sống/chết của DB, Redis, dung lượng đĩa, RAM để phục vụ việc giám sát khi deploy.

---

## User Review Required

> [!IMPORTANT]
> Vui lòng xem xét các lựa chọn quan trọng sau đây trước khi chúng ta bắt đầu khởi tạo dự án:
> 1. **Cấu hình DB Cloud**: Bạn muốn deploy PostgreSQL lên **Supabase** hay sử dụng PostgreSQL addon có sẵn trực tiếp trên **Railway**? (Sử dụng Supabase miễn phí rất tốt và có dashboard UI quản lý DB tuyệt vời).
> 2. **Redis Hosting**: Khi deploy lên Railway, ta sẽ cần một instance Redis để phục vụ Queue (BullMQ) và Caching/Socket. Bạn có muốn sử dụng Redis addon của Railway hay một dịch vụ Cloud Redis miễn phí khác không (như Upstash Redis)?

---

## Cấu Trúc Cây Thư Mục Chuẩn (Optimized Project Tree)

Dưới đây là sơ đồ thư mục được thiết kế theo dạng **Modular Architecture** (kiến trúc mô-đun hóa). 
```text
capstone_ck_nodejs/
├── prisma/                       # Cấu hình Prisma ORM
│   ├── schema.prisma             # Định nghĩa Database Schema (Models, Relations, Indexes)
│   └── migrations/               # Lịch sử các phiên bản migration cơ sở dữ liệu
├── src/
│   ├── app.module.ts             # Module gốc của toàn bộ ứng dụng
│   ├── main.ts                   # File chạy chính, cấu hình Swagger, Pipes, Interceptors, CORS
│   │
│   ├── common/                   # Code dùng chung toàn hệ thống (Cross-cutting Concerns)
│   │   ├── decorators/           # Custom Decorators (vd: @CurrentUser, @Public, @Roles)
│   │   ├── dto/                  # DTO dùng chung (vd: PaginationQueryDto)
│   │   ├── filters/              # Bộ lọc bắt lỗi toàn cục (PrismaExceptionFilter, HttpExceptioFilter)
│   │   ├── guards/               # Các chốt chặn bảo mật (JwtAuthGuard, RolesGuard, ThrottlerGuard)
│   │   ├── interceptors/         # Bộ chặn dữ liệu đầu ra/vào (TransformInterceptor, LoggingInterceptor)
│   │   ├── interfaces/           # Khai báo kiểu dữ liệu chung, enum, custom types
│   │   ├── pipes/                # Custom Pipes (vd: ParseUUIDPipe, SanitizePipe)
│   │   └── utils/                # Các helper tiện ích (mã hóa bcrypt, xử lý chuỗi, định dạng ngày)
│   │
│   ├── config/                   # Quản lý cấu hình & biến môi trường (.env)
│   │   ├── configuration.ts      # Chuyển đổi và gom các biến .env thành JS Object có phân cấp
│   │   ├── config.validation.ts  # Sử dụng Joi/Zod để VALIDATE nghiêm ngặt các biến .env khi khởi động
│   │   └── swagger.config.ts     # Cấu hình Swagger API Document đẹp mắt, bảo mật bằng Basic Auth (optional)
│   │
│   ├── providers/                # Các dịch vụ Hạ tầng / Bên thứ ba (Infrastructures)
│   │   ├── database/             # Module kết nối Cơ sở dữ liệu
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts # Kế thừa PrismaClient, xử lý connection pool, soft delete
│   │   ├── cloudinary/           # Module upload file trực tiếp lên Cloudinary
│   │   │   ├── cloudinary.module.ts
│   │   │   └── cloudinary.service.ts # Upload/Xóa file sử dụng Cloudinary SDK
│   │   ├── mail/                 # Module gửi Email thông báo
│   │   │   ├── templates/        # Chứa file giao diện Email (welcome.hbs, reset-password.hbs)
│   │   │   ├── mail.module.ts
│   │   │   └── mail.service.ts
│   │   ├── queue/                # Module hàng đợi xử lý tác vụ nặng (BullMQ & Redis)
│   │   │   └── queue.module.ts
│   │   ├── logger/               # Module Logging chuyên nghiệp bằng Winston (ghi file xoay vòng, log console)
│   │   │   ├── logger.module.ts
│   │   │   └── logger.service.ts
│   │   └── redis/                # Kết nối Redis dùng cho Caching, Socket.io Adapter, Throttler
│   │       ├── redis.module.ts
│   │       └── redis.service.ts
│   │
│   ├── modules/                  # Các Mô-đun Nghiệp vụ chính (Domain Business)
│   │   ├── auth/                 # Module Xác thực và Phân quyền
│   │   │   ├── controllers/      # auth.controller.ts (Login, Register, Refresh Token, Reset Password)
│   │   │   ├── services/         # auth.service.ts (Xử lý JWT, so khớp Bcrypt, cấp phát token)
│   │   │   ├── strategies/       # jwt.strategy.ts, refresh-token.strategy.ts, google.strategy.ts
│   │   │   ├── dto/              # login.dto.ts, register.dto.ts, forgot-password.dto.ts
│   │   │   └── auth.module.ts
│   │   ├── users/                # Module Quản lý Người dùng
│   │   │   ├── controllers/      # users.controller.ts (Profile, Update Profile, List Users)
│   │   │   ├── services/         # users.service.ts (Các truy vấn DB liên quan đến user)
│   │   │   ├── dto/              # create-user.dto.ts, update-user.dto.ts, query-user.dto.ts
│   │   │   └── users.module.ts
│   │   ├── chat/                 # Module Sockets Realtime (Chat, Live Update, Realtime Alerts)
│   │   │   ├── gateway/          # chat.gateway.ts (Socket.io gateways, lắng nghe/phát event)
│   │   │   ├── services/         # chat.service.ts (Lưu lịch sử tin nhắn, quản lý phòng chat)
│   │   │   ├── adapter/          # redis-io.adapter.ts (Adapter giúp scale socket bằng Redis Pub/Sub)
│   │   │   └── chat.module.ts
│   │   └── notification/         # Module xử lý thông báo ngầm qua hàng đợi Queue (Mail, SMS, Push Notification)
│   │       ├── processors/       # mail.processor.ts (Nhận job từ hàng đợi BullMQ và thực thi gửi mail)
│   │       ├── services/         # notification.service.ts (Đưa tác vụ gửi thông báo vào hàng đợi)
│   │       └── notification.module.ts
│   │
├── .env.example                  # File cấu hình biến môi trường mẫu (không chứa key nhạy cảm)
├── .env                          # File chứa cấu hình môi trường thực tế (ĐÃ ADD VÀO .gitignore)
├── .gitignore                    # Cấu hình bỏ qua các file nhạy cảm và thư mục rác khi push Git
├── Dockerfile                    # Multi-stage Dockerfile tối ưu kích thước image khi chạy production
├── docker-compose.yml            # Khởi tạo nhanh PostgreSQL, Redis, PgAdmin, Mailhog cho local dev
├── nest-cli.json                 # Cấu hình NestJS CLI
├── package.json                  # Quản lý các dependencies và scripts vận hành (dev, build, start, migrate)
├── tsconfig.json                 # Cấu hình TypeScript compiler toàn hệ thống
└── README.md                     # Hướng dẫn cài đặt, chạy dự án chi tiết
```

---

## Chi Tiết Đề Xuất Các Thành Phần Công Nghệ

### 1. Authentication & Authorization (Bảo mật tối đa)
- **JWT Flow**: Sử dụng cặp đôi **Access Token** (hạn ngắn, ví dụ: 15 phút, lưu trong memory hoặc Authorization header) và **Refresh Token** (hạn dài, ví dụ: 7 ngày, lưu trong HTTP-Only Cookie để chống XSS/CSRF).
- **Phân quyền nâng cao**: Kết hợp `@Roles()` decorator và `RolesGuard` để phân quyền Role-based Access Control (RBAC).
- **Bcrypt**: Sử dụng helper mã hóa mật khẩu bất đồng bộ với salt round là 10.

### 2. Validation Pipe & Global Interceptor (Kiểm soát dữ liệu đầu ra/vào)
- **Validation**: Sử dụng `ValidationPipe` tích hợp sẵn của NestJS cấu hình `whitelist: true` (tự động loại bỏ các thuộc tính không được khai báo trong DTO) và `forbidNonWhitelisted: true` (ném lỗi nếu client gửi dữ liệu lạ lên).
- **Thống nhất API Response**: Sử dụng `TransformInterceptor` chuyển đổi mọi dữ liệu trả về theo khuôn dạng chuẩn:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Success",
    "data": { ... }
  }
  ```

### 3. Prisma ORM & Database Cloud (Supabase/PostgreSQL)
- **Prisma Client**: Tạo một `PrismaService` kế thừa từ `PrismaClient` có xử lý ngắt kết nối an toàn khi server shutdown (`onModuleDestroy`).
- **Supabase Integration**: Sử dụng Database URL do Supabase cung cấp (chế độ Transaction pool qua PgBouncer hoặc Session direct connection).
- **Database Schema**: Xây dựng schema chặt chẽ với các quan hệ (Relations), chỉ mục (Indexes) để tăng tốc độ truy vấn.

### 4. Upload Cloudinary (Đơn giản, Trực tiếp & Hiệu quả)
- Thiết lập một `CloudinaryModule` và `CloudinaryService` tích hợp trực tiếp thư viện SDK chính thức của Cloudinary.
- Tận dụng `Multer` của NestJS để đón file dạng buffer, sau đó upload lên Cloudinary qua stream một cách mượt mà không cần lưu tạm file ở local disk.

### 5. Socket.io Gateway (Realtime với độ trễ siêu thấp)
- **Auth Guard cho Sockets**: Bảo vệ cổng Websocket bằng JWT. Client phải truyền Access Token qua query hoặc headers khi handshake. Gateways sẽ xác thực token trước khi cho phép kết nối.
- **Redis Adapter**: Sử dụng `@nestjs/platform-socket.io` kết hợp `socket.io-redis` adapter giúp hệ thống có thể mở rộng chạy nhiều instance (scale-up) sau này trên Railway mà không sợ đứt gãy kết nối realtime.

### 6. Background Queue (Xử lý hàng đợi BullMQ & Redis)
- **BullMQ**: Thư viện hàng đợi mạnh mẽ nhất cho NodeJS dựa trên Redis. Các tác vụ tốn thời gian như gửi email hàng loạt, xử lý ảnh, đồng bộ dữ liệu sẽ được đẩy vào queue để chạy ngầm (asynchronous background jobs), giúp tăng tốc phản hồi API lên tối đa.

### 7. Swagger (Tự động hóa tài liệu API)
- Sử dụng `@nestjs/swagger` để tự động sinh tài liệu API từ decorators và DTO.
- Bật xác thực Basic Auth bảo vệ trang tài liệu API trên production để tránh lộ thông tin nội bộ.

### 8. Docker & Docker-Compose (Chuẩn hóa môi trường)
- **Development compose**: File `docker-compose.yml` khởi tạo nhanh toàn bộ hạ tầng gồm PostgreSQL, Redis, Mailhog (giả lập server nhận mail để test gửi mail offline cực kỳ mượt mà).
- **Production Dockerfile**: Sử dụng kỹ thuật **Multi-stage build** giúp kích thước Docker image siêu nhẹ (chỉ khoảng ~150-200MB thay vì >1GB), loại bỏ hoàn toàn devDependencies, tăng tính bảo mật và tốc độ khởi động container trên cloud.

---

## Kế Hoạch Triển Khai (Verification & Execution Plan)

### Bước 1: Khởi Tạo Dự Án (Init NestJS & Docker)
1. Chạy lệnh tạo mới dự án NestJS trống trong workspace.
2. Thiết lập cấu hình TypeScript, Prettier, ESLint.
3. Tạo file `docker-compose.yml` khởi chạy Postgres & Redis cục bộ để phát triển dễ dàng.

### Bước 2: Thiết Lập Prisma ORM & Database Cloud
1. Cài đặt Prisma CLI và Client.
2. Khởi tạo file schema Prisma, cấu hình liên kết với Supabase Cloud Database / Local Postgres.
3. Tạo các model cơ bản (`User`, `Session`, `Profile`). Chạy migration đầu tiên.

### Bước 3: Core Providers (Config, Logger, Exceptions, Mail, Cloudinary)
1. Cấu hình `@nestjs/config` kết hợp schema validation Joi bảo đảm ứng dụng chỉ khởi động khi đủ biến môi trường hợp lệ.
2. Thiết lập Winston Logger và bộ lọc lỗi Exception Filters toàn hệ thống.
3. Triển khai Module Cloudinary và Module gửi Mail kết hợp BullMQ Queue.

### Bước 4: Core Modules (Auth, Sockets, Realtime Chat)
1. Xây dựng JWT Authentication (luồng Access & Refresh Token, Auth Guards, Roles).
2. Xây dựng Sockets Gateway với Redis Adapter và xác thực JWT.
3. Liên kết hàng đợi (BullMQ) với email và các sự kiện realtime.

### Bước 5: Refactor Code, Đóng Gói Swagger & Deploy
1. Đồng bộ hóa Swagger API cho toàn bộ các endpoint.
2. Viết tài liệu và chuẩn bị các cấu hình cần thiết để deploy lên **Railway**.

---

## Kế Hoạch Xác Minh (Verification Plan)

### Automated Checks
- Chạy thử lệnh build dự án để chắc chắn không bị lỗi biên dịch:
  ```bash
  npm run build
  ```

### Manual Verification
- Truy cập Swagger UI tại đường dẫn `/api/docs` để xác thực tài liệu API được sinh đầy đủ.
- Khởi động Docker-Compose và kiểm tra kết nối giữa NestJS với PostgreSQL, Redis thành công qua logs khởi động.
- Sử dụng một client socket đơn giản (HTML + Socket.io client) kiểm tra luồng handshake kết nối thành công và truyền nhận event realtime.
