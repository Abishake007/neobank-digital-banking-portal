# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy the entire project
COPY . .

# Grant permission and build the sub-project
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests -pl backend-banking-portal -am

# Stage 2: Run
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built JAR from the subfolder's target directory
COPY --from=build /app/backend-banking-portal/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]