# Use JDK 21 to match your project
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Since Root Directory is 'backend-banking-portal', 
# '.' refers to the contents of that folder
COPY . .

# Grant permission and build
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built JAR from the target folder
COPY --from=build /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]