FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# 👇 ADD THIS LINE (IMPORTANT)
RUN chmod +x mvnw

RUN ./mvnw dependency:go-offline

COPY src src

RUN ./mvnw clean package -DskipTests

ENV PORT=8080

EXPOSE 8080

CMD ["sh", "-c", "java -jar target/*.jar --server.port=${PORT}"]