# Stage 1: Build bằng Maven
FROM maven:3.9.11-eclipse-temurin-17 AS build
WORKDIR /app

# Copy toàn bộ source vào container
COPY . .

# Build project, tạo file .war trong target/
RUN mvn clean package -DskipTests

# Stage 2: Deploy vào Tomcat
FROM tomcat:10.1-jdk17

# Xóa app mặc định của Tomcat (ROOT)
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy file WAR từ stage build sang Tomcat
COPY --from=build /app/target/EmailList23133055-1.0-SNAPSHOT.war /usr/local/tomcat/webapps/ROOT.war

EXPOSE 8080
CMD ["catalina.sh", "run"]
