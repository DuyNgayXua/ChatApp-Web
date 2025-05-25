# Sử dụng node:lts-alpine để xây dựng image nhẹ
FROM node:lts-alpine

# Thiết lập biến môi trường cho production
ENV NODE_ENV=production

# Thiết lập thư mục làm việc trong container
WORKDIR /usr/src/app

# Copy các file quản lý dependencies vào trước để tối ưu cache khi build
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

# Cài đặt các dependencies cho môi trường sản xuất
RUN npm install --production --silent

# Copy toàn bộ mã nguồn vào container
COPY . .

# Expose cổng ứng dụng
EXPOSE 8004

# Chạy dưới quyền user không phải root
RUN addgroup app && adduser -S -G app app
USER app

# Chạy lệnh khởi động ứng dụng
CMD ["npm", "start"]
